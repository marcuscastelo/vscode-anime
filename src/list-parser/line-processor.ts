import { DiagnosticRelatedInformation, DiagnosticSeverity, Location, Range, TextDocument, TextLine } from "vscode";
import ShowStorage from "../cache/shows/show-storage";
import DocumentReader from "../utils/document-reader";
import { Show } from "../cache/shows/cached-shows";
import MADiagnosticController from "../lang/maDiagnosticCollection";
import LineContext from "./line-context";
import { LineType } from "./line-type";
import { CompleteWatchEntry, DocumentContexted, PartialWatchEntry, WatchEntry } from "../types";
import { checkTags } from "../analysis/check-tags";
import LineIdentifier from "./line-identifier";
import { DateLineInfo, ShowTitleLineInfo, TagLineInfo, WatchEntryLineInfo } from "./line-info";
import { isErr } from "rustic";
import { Tag, TagTarget } from "../core/tag";
import { MarucsAnime } from "../extension";
import { Supplier } from "../utils/typescript-utils";

export default class LineProcessor {
    private lineContext: Partial<LineContext>;
    constructor(
        private getStorage: Supplier<ShowStorage>,
        private diagnosticController: MADiagnosticController
    ) {
        this.lineContext = {};
    }

    processDocument(document: TextDocument) {
        let reader = new DocumentReader(document);

        console.log(`Processing ${document.uri}...`);
        for (let currentLine of reader) {
            this.processLine(currentLine, reader);

            if (reader.lineCount < 10 || currentLine.lineNumber % Math.floor(reader.lineCount / 10) === 0) {
                console.log(`${currentLine.lineNumber + 1}/${reader.lineCount} lines read (${((currentLine.lineNumber + 1) / reader.lineCount * 100).toFixed(2)}%)`);
            }
        }
    }

    processLine(line: TextLine, reader: DocumentReader) {
        let lineInfo = LineIdentifier.identifyLine(line);

        if (lineInfo.type === LineType.ShowTitle) {
            this.processShowTitleLine(lineInfo, reader.document);
        } else if (lineInfo.type === LineType.WatchEntry) {
            this.processWatchLine(lineInfo);
        } else if (lineInfo.type === LineType.Date) {
            this.processDateLine(lineInfo);
        } else if (lineInfo.type === LineType.Tag) {
            this.processTag(lineInfo, reader);
        }
        else if (lineInfo.type === LineType.Invalid) {
            for (let error of lineInfo.errors) {
                this.diagnosticController.addLineDiagnostic(line, error);
            }
        }
    }

    processDateLine(lineInfo: DateLineInfo) {
        this.lineContext.currentDateLine = lineInfo;

        //Resets current anime, so that it is necessary to explicitly set an anime title everytime the day changes
        this.lineContext.currentShowLine = undefined;
    }

    processShowTitleLine(lineInfo: ShowTitleLineInfo, document: TextDocument) {
        const showTitle = lineInfo.params.showTitle;

        if (showTitle === this.lineContext.currentShowLine?.params.showTitle) {
            this.diagnosticController.addLineDiagnostic(lineInfo.line, 'Redundant show title');
            return;
        }

        this.lineContext.currentTagsLines = this.lineContext.currentTagsLines?.filter(lineInfo => lineInfo.params.tag.target !== TagTarget.SHOW && lineInfo.params.tag.target !== TagTarget.WATCH_SESSION);

        const storage = this.getStorage();
        const showResult = storage.getOrCreateShow(showTitle, lineInfo.line.lineNumber, this.lineContext.currentTagsLines?.map(lineInfo => lineInfo.params.tag));

        if (isErr(showResult)) {
            this.diagnosticController.addLineDiagnostic(lineInfo.line, `Error while processing show: ${showResult.data}`);
            return;
        }

        //TODO: check for empty sessions ( i.e: no watch entries between titles )
        const currShow = showResult.data;
        currShow.updateLastMentionedLine(lineInfo.line.lineNumber);

        const currTags = this.lineContext.currentTagsLines?.map(lineInfo => lineInfo.params.tag) || [];
        const { missingTags, extraTags } = checkTags(currTags, currShow);
    
        const names = (tag: Tag) => tag.name;
        const toList = (accum: string, token: string) => accum + ',' + token;
        const listTags = (tags: Tag[]) => tags.map(names).reduce(toList, '');

        let relatedErrorMessage = '';
        let messageBitmask = ((missingTags.length > 0) ? 1 : 0) | ((extraTags.length > 0) ? 2 : 0);
        if (messageBitmask !== 0) { relatedErrorMessage = "Error: "; }
        if (messageBitmask & 1) { relatedErrorMessage += `those tags are missing: [${listTags(missingTags)}]`; }
        if (messageBitmask & 3) { relatedErrorMessage += `\nand `; }
        if (messageBitmask & 2) { relatedErrorMessage += `too many tags: [${listTags(extraTags)}]`; }

        if (messageBitmask !== 0) {
            this.diagnosticController.addDiagnostic({
                message: `Incorrect tagging (does not align with previous definition): ${relatedErrorMessage}`,
                range: lineInfo.line.range,
                severity: DiagnosticSeverity.Error,
                relatedInformation: [{ location: new Location(document.uri, document.lineAt(currShow.info.firstMentionedLine).range), message: "Fist show declaration is here" }]
            });
        }

        this.lineContext.currentShowLine = lineInfo;
        this.lineContext.currentTagsLines = this.lineContext.currentTagsLines?.filter(lineInfo => lineInfo.params.tag.target !== TagTarget.SHOW);
    }

    processWatchLine(lineInfo: WatchEntryLineInfo) {
        let { currentShowLine } = this.lineContext;

        if (!currentShowLine) {
            this.diagnosticController.addLineDiagnostic(lineInfo.line, "Anime title not defined (or ill-defined)");
            return;
        }

        const currentShowTitle = currentShowLine.params.showTitle;
        let currentShow = this.getStorage().searchShow(currentShowLine.params.showTitle);

        this.lineContext.currentTagsLines = this.lineContext.currentTagsLines?.filter(lineInfo => lineInfo.params.tag.target !== TagTarget.WATCH_LINE);

        if (!currentShowTitle) {
            this.diagnosticController.addLineDiagnostic(lineInfo.line, "Watch Entry provided, but not inside a show");
            return;
        }

        if (!currentShow) {
            throw new Error(`Unexpected error: anime '${currentShowTitle}' not found in list, despite being the current show`);
        }

        let { startTime, endTime, episode, company: friends } = lineInfo.params;
        if (episode !== '--' && isNaN(parseInt(episode))) {
            this.diagnosticController.addLineDiagnostic(lineInfo.line, "Episode is nor a number nor --");
            return;
        }

        const validTimeReg = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
        const lineRange = lineInfo.line.range;
        const lineStart = lineRange.start;

        if (!validTimeReg.test(startTime)) {
            this.diagnosticController.addRangeDiagnostic(new Range(lineStart, lineStart.with({ character: 4 })), 'WatchEntry: Invalid startTime');
        }

        if (!validTimeReg.test(endTime)) {
            this.diagnosticController.addRangeDiagnostic(new Range(lineStart.with({ character: 6 }), lineStart.with({ character: 10 })), 'WatchEntry: Invalid endTime');
        }

        //TODO: consider currDate and 23:59 - 00:00 entries
        let watchEntry: WatchEntry;
        if (episode === '--') {
            const lastEpisode = currentShow.info.lastCompleteWatchEntry?.data.episode ?? 0;
            watchEntry = <PartialWatchEntry>{
                partial: true,
                showTitle: currentShowTitle,
                startTime,
                endTime,
                episode: lastEpisode + 1,
                lineNumber: lineInfo.line.lineNumber,
                company: friends
            };
        } else {
            watchEntry = <CompleteWatchEntry>{
                partial: false,
                showTitle: currentShowTitle,
                startTime,
                endTime,
                episode: parseInt(episode),
                lineNumber: lineInfo.line.lineNumber,
                company: friends
            };
        }

        const lastWatchedEpisode = currentShow.info.lastCompleteWatchEntry?.data.episode ?? 0;
        if (lastWatchedEpisode >= watchEntry.episode) {
            //TODO: related info last ep's line
            //TODO: check for skipped as well
            //TODO: check for [UNSAFE-ORDER]
            //TODO: check for REWATCH (major rewrite of the code to support this)
            function checkUnsafeOrder(currentTags: Tag[]) {
                return currentTags.find(tag => tag.name === 'UNSAFE-ORDER') !== undefined;
            }

            const currentTags = this.lineContext.currentTagsLines?.map(lineInfo => lineInfo.params.tag) ?? [];

            const isUnsafeOrder = checkUnsafeOrder(currentTags);
            const isSkip = false;
            const checkOrder = !isUnsafeOrder && !isSkip;
            if (checkOrder) {
                this.diagnosticController.addLineDiagnostic(lineInfo.line, "Watch entry violates ascending episodes rule");
            } else {
                this.diagnosticController.addDiagnostic({
                    message: `Unsafe = ${isUnsafeOrder}, skip = ${isSkip}`,
                    range: lineInfo.line.range,
                    severity: DiagnosticSeverity.Warning,
                    // relatedInformation: [{ location: new Location(lineInfo.line.uri, lineInfo.line.range), message: "Last watched episode is here" }]
                });
            }
        }

        const watchEntryCtx : DocumentContexted<WatchEntry> = {
            data: watchEntry,
            lineNumber: lineInfo.line.lineNumber
        };

        this.getStorage().registerWatchEntry(currentShowTitle, watchEntryCtx);

        for (let friend of friends) {
            this.getStorage().registerFriend(friend);
        }
    }

    processTag(lineInfo: TagLineInfo, reader: DocumentReader) {
        let { tagName } = lineInfo.params;

        let tag = MarucsAnime.INSTANCE.tagRegistry.get(tagName);

        if (!tag) {
            this.diagnosticController.addLineDiagnostic(lineInfo.line, "Unknown tag, ignoring!", { severity: DiagnosticSeverity.Warning });
            return;
        }

        if (tag.target === TagTarget.SHOW) {
            this.lineContext.currentShowLine = undefined;
        }

        for (let param of tag.parameters) {
            let tp = lineInfo.params.tagParams.find((tp) => tp.name === param);
            if (!tp) {
                this.diagnosticController.addLineDiagnostic(lineInfo.line, `Missing parameters, parameter list: [${tag.parameters.reduce((a, b) => `${a}, ${b}`)}]`);
                return;
            }
        }

        if (tag.name === 'SCRIPT-SKIP') {
            let paramValue = lineInfo.params.tagParams.find(tp => tp.name === 'count')?.value;
            let skipCount = parseInt(paramValue ?? '0');

            if (isNaN(skipCount)) {
                this.diagnosticController.addLineDiagnostic(lineInfo.line, `Invalid skip count = '${paramValue}'`);
                return;
            }

            reader.skipLines(skipCount);
        }

        if (tag.target !== TagTarget.SCRIPT_TAG) {
            if (this.lineContext.currentTagsLines?.map(lineInfo => lineInfo.params.tag).indexOf(tag) === -1) {
                console.log(`Adding tag ${tag.name}`);
                this.lineContext.currentTagsLines?.map(lineInfo => lineInfo.params.tag).push(tag);
            }
        }

        // let [tagType, parameters] = tag.indexOf(`=`) === -1 ? [tag, []] : tag.split(`=`);
        // tagType = tagType.toLocaleLowerCase();

        // if (tagType === `skip-lines`) {
        //     let skipCount = parseInt(parameters[0]);
        //     this.reader.skiplines(skipCount);
        // }
    }

}