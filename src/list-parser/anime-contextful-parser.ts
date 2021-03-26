/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */

import { TextDocument, TextLine } from "vscode";
import AnimeDataStorage from "../cache/anime/anime-data-storage";
import DocumentReader from "../utils/document-reader";
import { Tag, Tags } from "../types";
import Anime from "../cache/anime/anime";
import MADiagnosticController from "../lang/maDiagnosticCollection";
import AnimeContext from "./anime-context";
import MAListContextUtils, { Params } from "./maListContext";
import { LineType } from "./lineTypes";



function checkAnimeDeclHasRightTags(anime: Anime, reader: DocumentReader): boolean {
    return true;

    // let declLine = reader.currentLineIdx;

    // let tags = anime.getBasicInfo();
    // for (let tag in tags) {

    // }
    // //TODO: check if anime previously Tagged with some tags is tagged again the same

    // reader.jumpTo(declLine);
}


export default class MALineParser {

    private context: AnimeContext;
    constructor(
        private storage: AnimeDataStorage,
        private diagnosticController: MADiagnosticController
    ) {
        this.context = new AnimeContext();
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
        let {type, params} = MAListContextUtils.getLineInfo(line);

        if (type === LineType.ShowTitle) {
            this.processAnimeTitleLine(params, line);
        } else if (type === LineType.WatchEntry) {
            this.processWatchLine(params, line);
        } else if (type === LineType.Tag) {
            this.processTag(params, line);
        } else if (type === LineType.Invalid) {
            this.diagnosticController.markUnknownLineType(line);
        }
    }

    processAnimeTitleLine(params: Params, line: TextLine) {
        if (params["1"] === undefined) return;

        let animeName: string = params["1"];

        let currentAnime = this.storage.getOrCreateAnime(animeName, this.context.currTags);
        //TODO: checkAnimeDeclHasRightTags(currentAnime, this.reader);

        //TODO: check for empty sessions ( i.e: no watch entries between titles )
        currentAnime.updateLastMentionedLine(line.lineNumber);

        this.context.currShowName = animeName;

        //TODO: distinguish tag targets
        this.context.currTags = [];
        // for (let i = 0; i < this.currentContext.currTags.length; i++) {
        //     if (isShowTag()) {
        //         this.currentContext.currTags.splice(i, 1);
        //     }
        // }
    }

    processWatchLine(params: Params, line: TextLine) {
        let currAnimeName = this.context.currShowName ?? "unknown__definetelynotusednameindict";
        let currentAnime = this.storage.getAnime(currAnimeName);

        if (!currAnimeName) {
            console.error("400: Invalid state (episode with no anime) at line ", line.lineNumber);
            return;
        }

        if (!currentAnime) {
            console.error(`500: Unexpected error: anime '${currAnimeName}' not found in list, despite being the current anime`);
            return;
        }

        let startTime = params["1"];
        let endTime = params["2"];
        let episode = parseInt(params["3"]);

        let friends = params["4"]?.split(',').map(name => name.trim()) ?? [];


        if (episode === NaN) {
            console.error(`400: episode isn't a number`);
            return;
        }


        //TODO: create a WatchEntry and store it ( also remove .updateLastWatchedEpisode )
        currentAnime.updateLastWatchedEpisode(episode, line.lineNumber);

        for (let friend of friends)
            this.storage.registerFriend(friend);
        //
    }

    processTag(params: Params, line: TextLine) {
        let tagType = params["1"];
        let tag = Tags[tagType];

        //TODO: tag restrict context
        this.context.currTags.push(tag);

        // let [tagType, parameters] = tag.indexOf(`=`) === -1 ? [tag, []] : tag.split(`=`);
        // tagType = tagType.toLocaleLowerCase();

        // if (tagType === `skip-lines`) {
        //     let skipCount = parseInt(parameters[0]);
        //     this.reader.skiplines(skipCount);
        // }
    }

}