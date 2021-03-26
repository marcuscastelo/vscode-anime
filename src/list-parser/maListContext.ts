import { TextDocument, TextLine } from "vscode";
import { WatchEntry } from "../types";
import DocumentReader from "../utils/document-reader";
import { COMMENT_TOKEN_SPLITTER, DATE_REG, LineType, SHOW_TITLE_REG, TAG_REG, WATCH_REG } from "./lineTypes";

export type MAListContext = {
    currentShowTitle: string,
    currentDate: string,
    lastWatchEntry?: WatchEntry,
};

export type Params = {
    [key: string]: string
};

export interface LineInfo {
    type: LineType,
    params: Params
};

export default class MAListContextUtils {

    public static getContext(document: TextDocument, lineNumber: number) : {valid: boolean, context?: MAListContext} {
        let reader = new DocumentReader(document);
        reader.jumpTo(lineNumber);

        const isLineType = (regex: RegExp) => (line: TextLine) => line.text.match(DATE_REG) !== null
        const stepUp = -1;

        //Finds nearest date declaration
        let lastDateLine = reader.searchLine(stepUp, isLineType(DATE_REG));
        reader.jumpTo(lineNumber);
        //Finds nearest show title declaration
        let lastShowTitle = reader.searchLine(stepUp, isLineType(SHOW_TITLE_REG));
        reader.jumpTo(lineNumber);

        //Finds nearest watch entry declaration
        let lastWatchEntry = reader.searchLine(stepUp, isLineType(WATCH_REG));
        reader.jumpTo(lineNumber);

        if (!lastShowTitle.found || !lastDateLine.found) {
            return {
                valid: false,
                context: undefined
            };
        }
        
        let context: MAListContext = {
            currentShowTitle: lastShowTitle.line?.text ?? 'Unexpected error',
            currentDate: lastDateLine.line?.text ?? 'Unexpected error',
            // lastWatchEntry: new WatchEntry lastWatchEntry.line?.text
        }

        return {
            valid: true,
            context
        };
    }

    public static getLineInfo(line: TextLine): LineInfo {
        let text = line.text;

        let commentTokenPosition = text.indexOf(COMMENT_TOKEN_SPLITTER);
        if (commentTokenPosition !== -1) {
            text = text.substring(0, commentTokenPosition);
        }

        let groups: { [key: string]: any } | null;

        groups = SHOW_TITLE_REG.exec(text);
        if (groups) {
            return {
                type: LineType.AnimeTitle,
                params: groups
            };
        }
        groups = DATE_REG.exec(text);
        if (groups) {
            return {
                type: LineType.Date,
                params: groups
            };
        }

        groups = WATCH_REG.exec(text);
        if (groups) {
            return {
                type: LineType.Watch,
                params: groups
            };
        }

        groups = TAG_REG.exec(text);
        if (groups) {
            return {
                type: LineType.Tag,
                params: groups
            };
        }

        if (text === '') {
            return {
                type: LineType.Ignored,
                params: {}
            }
        }

        return {
            type: LineType.Invalid,
            params: {}
        };
    }

}