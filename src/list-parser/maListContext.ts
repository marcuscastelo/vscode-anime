import { assert } from "node:console";
import { TextDocument, TextLine } from "vscode";
import { Tag, Tags, WatchEntry } from "../types";
import DocumentReader from "../utils/document-reader";
import LineInfoParser, { DateLineInfo, ShowTitleLineInfo } from "./line-info-extractor";
import { COMMENT_TOKEN, DATE_REG, LineType, SHOW_TITLE_REG, TAG_REG, WATCH_REG } from "./lineTypes";

export type MAListContext = {
    currentShowTitle: string,
    currentDate: string,
    lastWatchEntry?: WatchEntry,
};

export type Params = {
    [key: string]: string
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
                    const lineInfo = LineInfoParser.getLineInfo(line);
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

        let currentShowTitle = (showTitleRes.data as ShowTitleLineInfo).params.showTitle;
        let currentDate = (dateRes.data as DateLineInfo).params.date;

        let lastWatchEntry: WatchEntry | undefined;

        if (watchEntryRes.success && watchEntryRes.data.type === LineType.WatchEntry) {
            lastWatchEntry = {
                animeName: currentShowTitle,
                startTime: watchEntryRes.data.params.startTime,
                endTime: watchEntryRes.data.params.endTime,
                episode: watchEntryRes.data.params.episode,
                line: watchEntryRes.data.line.lineNumber,
                company: watchEntryRes.data.params.friends,
            }
        }

        let context: MAListContext = {
            currentShowTitle,
            currentDate,
            lastWatchEntry,
        }

        return {
            valid: true,
            context
        };
    }

    

}