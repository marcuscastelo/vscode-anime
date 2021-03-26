import { TextDocument, TextLine } from "vscode";
import { WatchEntry } from "../types";
import DocumentReader from "../utils/document-reader";
import { COMMENT_TOKEN, DATE_REG, LineType, SHOW_TITLE_REG, TAG_REG, WATCH_REG } from "./lineTypes";

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
    params: Params,
    line: TextLine,
};

type GetContextResult =
    | { valid: true, context: MAListContext }
    | { valid: false, error: Error };


export default class MAListContextUtils {

    public static getContext(document: TextDocument, lineNumber: number): GetContextResult {
        let reader = new DocumentReader(document);
        reader.jumpTo(lineNumber);

        const lineMatcherFactory =
            (lineType: LineType) => ({
                testLine: (line: TextLine) => {
                    const lineInfo = this.getLineInfo(line);
                    return {
                        success: lineInfo.type == lineType,
                        data: lineInfo
                    };
                }
            })

        //Finds nearest date declaration
        let dateRes = reader.searchLine(-1, lineMatcherFactory(LineType.Date));
        reader.jumpTo(lineNumber);

        //Finds nearest show title declaration
        let showTitleRes = reader.searchLine(-1, lineMatcherFactory(LineType.ShowTitle));
        reader.jumpTo(lineNumber);

        //Finds nearest watch entry declaration
        let watchEntryRes = reader.searchLine(-1, lineMatcherFactory(LineType.WatchEntry));
        reader.jumpTo(lineNumber);

        if (!showTitleRes.success || !dateRes.success) {
            return {
                valid: false,
                error: new Error(
                    `Undefined context:` +
                    `\n\tLast ShowTitle: ${showTitleRes.success ? showTitleRes.data.line.lineNumber : 'Not Found'},` +
                    `\n\tLast Date: ${dateRes.success ? dateRes.data.line.lineNumber : 'Not Found'}`
                ),
            };
        }

        let context: MAListContext = {
            currentShowTitle: showTitleRes.data.params["1"],
            currentDate: dateRes.data.params["1"],
            // lastWatchEntry: new WatchEntry lastWatchEntry.line?.text
        }

        return {
            valid: true,
            context
        };
    }

    public static getLineInfo(line: TextLine): LineInfo {
        let text = line.text;

        let commentTokenPosition = text.indexOf(COMMENT_TOKEN);
        if (commentTokenPosition !== -1) {
            text = text.substring(0, commentTokenPosition);
        }

        let groups: { [key: string]: any } | null;

        groups = SHOW_TITLE_REG.exec(text);
        if (groups) {
            return {
                type: LineType.ShowTitle,
                params: groups,
                line,
            };
        }
        groups = DATE_REG.exec(text);
        if (groups) {
            return {
                type: LineType.Date,
                params: groups,
                line,
            };
        }

        groups = WATCH_REG.exec(text);
        if (groups) {
            return {
                type: LineType.WatchEntry,
                params: groups,
                line,
            };
        }

        groups = TAG_REG.exec(text);
        if (groups) {
            return {
                type: LineType.Tag,
                params: groups,
                line,
            };
        }

        if (text === '') {
            return {
                type: LineType.Ignored,
                params: {},
                line,
            }
        }

        return {
            type: LineType.Invalid,
            params: {},
            line,
        };
    }

}