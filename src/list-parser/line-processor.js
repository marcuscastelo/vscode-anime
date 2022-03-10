"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const document_reader_1 = require("../utils/document-reader");
const anime_context_1 = require("./anime-context");
const line_type_1 = require("./line-type");
const line_info_parser_1 = require("./line-info-parser");
const types_1 = require("../types");
class LineProcessor {
    constructor(storage, diagnosticController) {
        this.storage = storage;
        this.diagnosticController = diagnosticController;
        this.lineContext = new anime_context_1.default();
    }
    processAllLines(document) {
        let reader = new document_reader_1.default(document);
        for (let currentLine of reader.getIterator()) {
            if (currentLine.lineNumber % Math.floor(reader.lineCount / 10) === 0) {
                console.log(`${currentLine.lineNumber}/${reader.lineCount} lines read (${(currentLine.lineNumber / reader.lineCount * 100).toFixed(2)}%)`);
            }
            this.processLine(currentLine, reader);
        }
    }
    processLine(line, reader) {
        let lineInfo = line_info_parser_1.default.identifyLine(line);
        if (lineInfo.type === line_type_1.LineType.ShowTitle) {
            this.processShowTitleLine(lineInfo, reader.document);
        }
        else if (lineInfo.type === line_type_1.LineType.WatchEntry) {
            this.processWatchLine(lineInfo);
        }
        else if (lineInfo.type === line_type_1.LineType.Date) {
            this.processDateLine(lineInfo);
        }
        else if (lineInfo.type === line_type_1.LineType.Tag) {
            this.processTag(lineInfo, reader);
        }
        else if (lineInfo.type === line_type_1.LineType.Invalid) {
            for (let error of lineInfo.errors)
                this.diagnosticController.addLineDiagnostic(line, error);
        }
    }
    processDateLine(lineInfo) {
        this.lineContext.currDate = lineInfo.params.date;
        //Resets current anime, so that it is necessary to explicitly set an anime title everytime the day changes
        this.lineContext.currShowName = '';
    }
    processShowTitleLine(lineInfo, document) {
        const showTitle = lineInfo.params.showTitle;
        if (showTitle === this.lineContext.currShowName) {
            this.diagnosticController.addLineDiagnostic(lineInfo.line, 'Redundant show title');
            return;
        }
        const currentShow = this.storage.getOrCreateShow(showTitle, lineInfo.line.lineNumber, this.lineContext.currTags);
        //TODO: check for empty sessions ( i.e: no watch entries between titles )
        currentShow.updateLastMentionedLine(lineInfo.line.lineNumber);
        let missingTags = [];
        let extraTags = [];
        for (let tag of currentShow.info.tags) {
            if (tag.appliesTo === types_1.TagApplyInfo.SHOW) {
                if (this.lineContext.currTags.indexOf(tag) === -1) {
                    missingTags.push(tag);
                }
            }
        }
        for (let tag of this.lineContext.currTags) {
            if (tag.appliesTo === types_1.TagApplyInfo.SHOW) {
                if (currentShow.info.tags.indexOf(tag) === -1) {
                    extraTags.push(tag);
                }
            }
        }
        const names = (tag) => tag.tagType;
        const toList = (accum, token) => accum + ',' + token;
        const listTags = (tags) => tags.map(names).reduce(toList, '');
        let relatedErrorMessage = '';
        let messageBitmask = ((missingTags.length > 0) ? 1 : 0) | ((extraTags.length > 0) ? 2 : 0);
        if (messageBitmask !== 0)
            relatedErrorMessage = "Error: ";
        if (messageBitmask & 1)
            relatedErrorMessage += `those tags are missing: [${listTags(missingTags)}]`;
        if (messageBitmask & 3)
            relatedErrorMessage += `\nand `;
        if (messageBitmask & 2)
            relatedErrorMessage += `too many tags: [${listTags(extraTags)}]`;
        if (messageBitmask !== 0) {
            this.diagnosticController.addDiagnostic({
                message: `Incorrect tagging (does not align with previous definition): ${relatedErrorMessage}`,
                range: lineInfo.line.range,
                severity: vscode_1.DiagnosticSeverity.Error,
                relatedInformation: [{ location: new vscode_1.Location(document.uri, document.lineAt(currentShow.info.firstMentionedLine).range), message: "Fist show declaration is here" }]
            });
        }
        this.lineContext.currShowName = showTitle;
        this.lineContext.currTags = this.lineContext.currTags.filter(tag => tag.appliesTo !== types_1.TagApplyInfo.SHOW);
    }
    processWatchLine(lineInfo) {
        let { currShowName: currShowTitle } = this.lineContext;
        let currentShow = this.storage.getShow(currShowTitle);
        this.lineContext.currTags = this.lineContext.currTags.filter(tag => tag.appliesTo !== types_1.TagApplyInfo.WATCH_LINE);
        if (!currShowTitle) {
            this.diagnosticController.addLineDiagnostic(lineInfo.line, "Watch Entry provided, but not inside a show");
            return;
        }
        if (!currentShow)
            throw new Error(`Unexpected error: anime '${currShowTitle}' not found in list, despite being the current show`);
        let { startTime, endTime, episode, friends } = lineInfo.params;
        if (episode === NaN) {
            this.diagnosticController.addLineDiagnostic(lineInfo.line, "Episode is not a number");
            return;
        }
        //TODO: consider currDate and 23:59 - 00:00 entries
        const watchEntry = {
            showTitle: currShowTitle,
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
            this.diagnosticController.addLineDiagnostic(lineInfo.line, "Watch entry violates ascending episodes rule");
        }
        this.storage.registerWatchEntry(currShowTitle, watchEntry);
        for (let friend of friends)
            this.storage.registerFriend(friend);
        //
    }
    processTag(lineInfo, reader) {
        let { tagName } = lineInfo.params;
        let tag = types_1.Tags[tagName];
        if (!tag) {
            this.diagnosticController.addLineDiagnostic(lineInfo.line, "Unknown tag, ignoring!", { severity: vscode_1.DiagnosticSeverity.Warning });
            return;
        }
        if (tag.appliesTo === types_1.TagApplyInfo.SHOW) {
            this.lineContext.currShowName = '';
        }
        for (let param of tag.parameters) {
            let tp = lineInfo.params.tagParams.find((tp) => tp.name == param);
            if (!tp) {
                this.diagnosticController.addLineDiagnostic(lineInfo.line, `Missing parameters, parameter list: [${tag.parameters.reduce((a, b) => `${a}, ${b}`)}]`);
                return;
            }
        }
        if (tag.tagType === 'SCRIPT-SKIP') {
            let paramValue = lineInfo.params.tagParams.find(tp => tp.name === 'count')?.value;
            let skipCount = parseInt(paramValue ?? '0');
            if (isNaN(skipCount)) {
                this.diagnosticController.addLineDiagnostic(lineInfo.line, `Invalid skip count = '${paramValue}'`);
                return;
            }
            reader.skip(skipCount);
        }
        if (tag.appliesTo !== types_1.TagApplyInfo.SCRIPT_TAG) {
            if (this.lineContext.currTags.indexOf(tag) === -1)
                this.lineContext.currTags.push(tag);
        }
        // let [tagType, parameters] = tag.indexOf(`=`) === -1 ? [tag, []] : tag.split(`=`);
        // tagType = tagType.toLocaleLowerCase();
        // if (tagType === `skip-lines`) {
        //     let skipCount = parseInt(parameters[0]);
        //     this.reader.skiplines(skipCount);
        // }
    }
}
exports.default = LineProcessor;
//# sourceMappingURL=line-processor.js.map