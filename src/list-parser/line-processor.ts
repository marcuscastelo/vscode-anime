/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */

import { TextDocument, TextLine } from "vscode";
import AnimeDataStorage from "../cache/anime/anime-data-storage";
import DocumentReader from "../utils/document-reader";
import Anime from "../cache/anime/anime";
import MADiagnosticController from "../lang/maDiagnosticCollection";
import ListContext from "./anime-context";
import { LineType } from "./line-type";
import LineInfoParser, { ShowTitleLineInfo, TagLineInfo, WatchEntryLineInfo } from "./line-info-parser";
import { Tags } from "../types";


function checkAnimeDeclHasRightTags(anime: Anime, reader: DocumentReader): boolean {
    return true;

    // let declLine = reader.currentLineIdx;

    // let tags = anime.getBasicInfo();
    // for (let tag in tags) {

    // }
    // //TODO: check if anime previously Tagged with some tags is tagged again the same

    // reader.jumpTo(declLine);
}


export default class LineProcessor {

    private lineContext: ListContext;
    constructor(
        private storage: AnimeDataStorage,
        private diagnosticController: MADiagnosticController
    ) {
        this.lineContext = new ListContext();
    }

    processAllLines(document: TextDocument) {
        let reader = new DocumentReader(document);

        for (let currentLine of reader.getIterator()) {

            if (currentLine.lineNumber % Math.floor(reader.lineCount / 10) === 0) {
                console.log(`${currentLine.lineNumber}/${reader.lineCount} lines read (${(currentLine.lineNumber / reader.lineCount * 100).toFixed(2)}%)`);
            }

            this.processLine(currentLine, reader);
        }
    }

    processLine(line: TextLine, reader: DocumentReader) {
        let lineInfo = LineInfoParser.parseLineInfo(line);

        if (lineInfo.type === LineType.ShowTitle) {
            this.processShowTitleLine(lineInfo);
        } else if (lineInfo.type === LineType.WatchEntry) {
            this.processWatchLine(lineInfo);
        } else if (lineInfo.type === LineType.Tag) {
            this.processTag(lineInfo);
        } else if (lineInfo.type === LineType.Invalid) {
            this.diagnosticController.markUnknownLineType(line);
        }
    }

    processShowTitleLine(lineInfo: ShowTitleLineInfo) {
        let currentShow = this.storage.getOrCreateAnime(lineInfo.params.showTitle, this.lineContext.currTags);
        //TODO: checkAnimeDeclHasRightTags(currentAnime, this.reader);

        //TODO: check for empty sessions ( i.e: no watch entries between titles )
        currentShow.updateLastMentionedLine(lineInfo.line.lineNumber);

        this.lineContext.currShowName = lineInfo.params.showTitle;

        //TODO: distinguish tag targets
        this.lineContext.currTags = [];
        // for (let i = 0; i < this.currentContext.currTags.length; i++) {
        //     if (isShowTag()) {
        //         this.currentContext.currTags.splice(i, 1);
        //     }
        // }
    }

    processWatchLine(lineInfo: WatchEntryLineInfo) {
        let { currShowName } = this.lineContext;
        let currentAnime = this.storage.getAnime(currShowName);

        //TODO: change errors to diagnostics

        if (!currShowName) {
            console.error("400: Invalid state (episode with no anime) at line ", lineInfo.line.lineNumber);
            return;
        }

        if (!currentAnime) {
            console.error(`500: Unexpected error: anime '${currShowName}' not found in list, despite being the current anime`);
            return;
        }

        let { startTime, endTime, episode, friends } = lineInfo.params;

        if (episode === NaN) {
            console.error(`400: episode isn't a number`);
            return;
        }

        //TODO: create a WatchEntry and store it ( also remove .updateLastWatchedEpisode )
        currentAnime.updateLastWatchedEpisode(episode, lineInfo.line.lineNumber);

        for (let friend of friends)
            this.storage.registerFriend(friend);
        //
    }

    processTag(lineInfo: TagLineInfo) {
        
        let {tagName} = lineInfo.params;

        //TODO: tag restrict context
        // this.lineContext.onTag(tag);

        if (tagName === "SKIP-LINES") {
            console.log('Skip lines!!');
            console.log(Tags[tagName]);
        }

        // let [tagType, parameters] = tag.indexOf(`=`) === -1 ? [tag, []] : tag.split(`=`);
        // tagType = tagType.toLocaleLowerCase();

        // if (tagType === `skip-lines`) {
        //     let skipCount = parseInt(parameters[0]);
        //     this.reader.skiplines(skipCount);
        // }
    }

}