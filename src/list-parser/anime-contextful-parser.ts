/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */

import { TextLine } from "vscode";
import AnimeDataStorage from "../cache/anime/anime-data-storage";
import DocumentReader from "../utils/document-reader";
import { AnimeContext, LineType, Tag, Tags } from "../types";
import Anime from "../cache/anime/anime";
import { read } from "node:fs";
import MADiagnosticController from "../lang/maDiagnosticCollection";

type Params = {
    [key: string]: string
};

const animeTitleReg = /^\s*([a-zA-Z].*)\:/g;
const dateReg = /(\d{2}\/\d{2}\/\d{4})/g;
const watchReg = /^([0-9]{2}:[0-9]{2})[ ]*-[ ]*([0-9]{2}:[0-9]{2})?[ ]*([0-9][0-9.]{1,})?[ ]*(?:\{(.*)\})?/;
const tagReg = /\[(.+)\]/;

function checkAnimeDeclHasRightTags(anime: Anime, reader: DocumentReader): boolean {
    return true;

    let declLine = reader.currentLineIdx;

    let tags = anime.getBasicInfo();
    for (let tag in tags) {
        
    }
    //TODO: check if anime previously Tagged with some tags is tagged again the same

    reader.gotoLine(declLine);
}

export function getLineInfo(line: TextLine): [LineType, Params] {
    
    
    let text = line.text;

    let groups: { [key: string]: any } | null;

    groups = animeTitleReg.exec(text);
    if (groups) 
        return [LineType.AnimeTitle, groups];
    groups = dateReg.exec(text);
    if (groups) 
        return [LineType.Date, groups];

    groups = watchReg.exec(text);
    if (groups) 
        return [LineType.Watch, groups];

    groups = tagReg.exec(text);
    if (groups) 
        return [LineType.Tag, groups];

    if (line.isEmptyOrWhitespace) return [LineType.Ignored, {}];

    return [LineType.Invalid, {}];

}

export default class AnimeContextfulParser {
    
    currentContext : AnimeContext = {
        currAnimeName: "",
        currDate: "",
        currTags: []
    };
    
    constructor(
        private storage: AnimeDataStorage,
        private reader: DocumentReader,
        private diagnosticController: MADiagnosticController
    ) {}

    processLine(line: TextLine) {
		let [type, params] = getLineInfo(line);

		if (type === LineType.AnimeTitle) {
			this.processAnimeTitleLine(params, line);
		} else if (type === LineType.Watch) {
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

        let currentAnime = this.storage.getOrCreateAnime(animeName, this.currentContext.currTags);
        //TODO: checkAnimeDeclHasRightTags(currentAnime, this.reader);

        //TODO: check for empty sessions ( i.e: no watch entries between titles )
        currentAnime.updateLastMentionedLine(line.lineNumber);
        
        this.currentContext.currAnimeName = animeName;

        //TODO: distinguish tag targets
        this.currentContext.currTags = [];
        // for (let i = 0; i < this.currentContext.currTags.length; i++) {
        //     if (isShowTag()) {
        //         this.currentContext.currTags.splice(i, 1);
        //     }
        // }
    }
    
    processWatchLine(params: Params, line: TextLine) {
        let currAnimeName = this.currentContext.currAnimeName ?? "unknown__definetelynotusednameindict";
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
        this.currentContext.currTags.push(tag);

        // let [tagType, parameters] = tag.indexOf(`=`) === -1 ? [tag, []] : tag.split(`=`);
        // tagType = tagType.toLocaleLowerCase();
    
        // if (tagType === `skip-lines`) {
        //     let skipCount = parseInt(parameters[0]);
        //     this.reader.skiplines(skipCount);
        // }
    }
    
}