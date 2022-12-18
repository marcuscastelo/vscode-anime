import { DiagnosticRelatedInformation, DiagnosticSeverity, Location, Range, TextDocument, TextLine } from "vscode";
import ShowStorage from "../cache/anime/showStorage";
import DocumentReader from "../utils/document-reader";
import { Show } from "../cache/anime/shows";
import MADiagnosticController from "../lang/maDiagnosticCollection";
import LineContext from "./line-context";
import { LineType } from "./line-type";
import LineIdentifier, { DateLineInfo, ShowTitleLineInfo, TagLineInfo, WatchEntryLineInfo } from "./line-info-parser";
import { Tag, TagTarget, Tags, WatchEntry } from "../types";
import assert = require("assert");


export default class LineProcessor {

    private lineContext: Partial<LineContext>;
    constructor(
        private storage: ShowStorage,
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
                console.log(`${currentLine.lineNumber+1}/${reader.lineCount} lines read (${((currentLine.lineNumber+1) / reader.lineCount * 100).toFixed(2)}%)`);
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

        const currentShow = this.storage.getOrCreateShow(showTitle, lineInfo.line.lineNumber, this.lineContext.currentTagsLines?.map(lineInfo => lineInfo.params.tag));

        //TODO: check for empty sessions ( i.e: no watch entries between titles )
        currentShow.updateLastMentionedLine(lineInfo.line.lineNumber);

        const currTags = this.lineContext.currentTagsLines?.map(lineInfo => lineInfo.params.tag) || [];

        let missingTags: Tag[] = [];
        let extraTags: Tag[] = [];
        for (let tag of currentShow.info.tags) {
            if (tag.target === TagTarget.SHOW) {
                if (currTags.indexOf(tag) === -1) {
                    missingTags.push(tag);
                }
            }
        }

        for (let tag of currTags) {
            if (tag.target === TagTarget.SHOW) {
                if (currentShow.info.tags.indexOf(tag) === -1) {
                    extraTags.push(tag);
                }
            }
        }

        const names = (tag: Tag) => tag.name;
        const toList = (accum: string, token: string) => accum + ',' + token;
        const listTags = (tags: Tag[]) => tags.map(names).reduce(toList, '');


        let relatedErrorMessage = '';
        let messageBitmask = ((missingTags.length > 0) ? 1 : 0) | ((extraTags.length > 0) ? 2 : 0);
        if (messageBitmask !== 0) { relatedErrorMessage = "Error: " ; }
        if (messageBitmask & 1  ) { relatedErrorMessage += `those tags are missing: [${listTags(missingTags)}]` ; }
        if (messageBitmask & 3  ) { relatedErrorMessage += `\nand ` ; }
        if (messageBitmask & 2  ) { relatedErrorMessage += `too many tags: [${listTags(extraTags)}]` ; }

        if (messageBitmask !== 0) {
            this.diagnosticController.addDiagnostic({
                message: `Incorrect tagging (does not align with previous definition): ${relatedErrorMessage}`,
                range: lineInfo.line.range,
                severity: DiagnosticSeverity.Error,
                relatedInformation: [{ location: new Location(document.uri, document.lineAt(currentShow.info.firstMentionedLine).range), message: "Fist show declaration is here" }]
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
        let currentShow = this.storage.getShow(currentShowLine.params.showTitle);

        this.lineContext.currentTagsLines = this.lineContext.currentTagsLines?.filter(lineInfo => lineInfo.params.tag.target !== TagTarget.WATCH_LINE);

        if (!currentShowTitle) {
            this.diagnosticController.addLineDiagnostic(lineInfo.line, "Watch Entry provided, but not inside a show");
            return;
        }

        if (!currentShow) {
            throw new Error(`Unexpected error: anime '${currentShowTitle}' not found in list, despite being the current show`);
        }

        let { startTime, endTime, episode, friends } = lineInfo.params;
        if (episode === NaN) {
            this.diagnosticController.addLineDiagnostic(lineInfo.line, "Episode is not a number");
            return;
        }

        //TODO: consider currDate and 23:59 - 00:00 entries
        const watchEntry: WatchEntry = {
            showTitle: currentShowTitle,
            startTime,
            endTime,
            episode,
            lineNumber: lineInfo.line.lineNumber,
            company: friends
        };

        const lastWatchedEpisode = currentShow.info.lastWatchEntry.episode;
        if (lastWatchedEpisode >= episode) {
            //TODO: related info last ep's line
            //TODO: check for skipped as well
            //TODO: check for [UNSAFE-ORDER]
            //TODO: check for REWATCH (major rewrite of the code to support this)
            const isUnsafeOrder = this.lineContext.currentTagsLines?.map(lineInfo => lineInfo.params.tag).indexOf(Tags['UNSAFE-ORDER']) !== -1;
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

        this.storage.registerWatchEntry(currentShowTitle, watchEntry);

        for (let friend of friends) {
            this.storage.registerFriend(friend);
        }
    }

    processTag(lineInfo: TagLineInfo, reader: DocumentReader) {

        let { tagName } = lineInfo.params;


        let tag = Tags[tagName];
        
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