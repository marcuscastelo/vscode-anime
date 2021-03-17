/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */

import { TextLine } from "vscode";
import AnimeDataStorage from "../anime-data-storage";
import DocumentReader from "../utils/document-reader";
import { AnimeContext, LineType } from "../types";


export function getLineInfo(line: TextLine): [LineType, { [key: string]: string}] {
    const animeTitleReg = /^\s*([a-zA-Z].*)\:/g;
    const dateReg = /(\d{2}\/\d{2}\/\d{4})/g;
    const watchReg = /(\d{2}:\d{2})\s*\-\s*(\d{2}:\d{2})\s+(\d{2,})/;
    const tagReg = /[(.+)]/;
    
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

    return [LineType.Ignored, {}];

}

export default class AnimeContextfulParser {
    
    currentContext : AnimeContext = {
        currAnimeName: "",
        currDate: ""
    };
    
    storage: AnimeDataStorage;
    constructor(storage: AnimeDataStorage) {
        this.storage = storage;
    }

    processLine(line: TextLine) {
		let [type, params] = getLineInfo(line);

		if (type === LineType.AnimeTitle) {
			this.processAnimeTitleLine(params, line);
		} else if (type === LineType.Watch) {
			this.processWatchLine(params, line);
		}
    }

    processAnimeTitleLine(params: { [key: string]: string }, line: TextLine) {
        if (params["1"] === undefined) return;
    
        let animeName: string = params["1"];
        let currentAnime = this.storage.getOrCreateAnime(animeName);
    
        currentAnime.lastLine = line.lineNumber;
        this.currentContext.currAnimeName = animeName;
    }
    
    processWatchLine(params: { [key: string] : string }, line: TextLine) {
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
        let episode = params["3"];
    
        if (parseInt(episode) === NaN) {
            console.error(`400: episode isn't a number`);
            return;
        }
    
        currentAnime.lastEp = parseInt(episode);
        currentAnime.lastLine = line.lineNumber;
    }
    
    
    
    // processTag(tag: string, reader: DocumentReader) {
    //     let [tagType, parameters] = tag.indexOf(`=`) === -1 ? [tag, []] : tag.split(`=`);
    //     tagType = tagType.toLocaleLowerCase();
    
    //     if (tagType === `skip-lines`) {
    //         let skipCount = parseInt(parameters[0]);
    //         reader.skiplines(skipCount);
    //     }
    // }
    
}