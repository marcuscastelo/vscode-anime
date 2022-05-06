import { TextDocument, TextLine } from "vscode";
import { Tag, Tags, WatchEntry } from "../types";
import DocumentReader from "../utils/document-reader";
import LineContext from "./line-context";
import LineIdentifier, { DateLineInfo, ShowTitleLineInfo } from "./line-info-parser";
import { COMMENT_TOKEN, DATE_REG, LineType, SHOW_TITLE_REG, TAG_REG, WATCH_REG } from "./line-type";

// export type LineContext = {
//     currentShowTitle: string,
//     currentDate: string,
//     lastWatchEntry?: WatchEntry,
// };

type GetContextResult =
    | { valid: true, context: LineContext }
    | { valid: false, error: Error };


export default class LineContextFinder {

    public static findContext(document: TextDocument, lineNumber: number): GetContextResult {
        let reader = new DocumentReader(document);
        reader.jumpTo(lineNumber);

        const lineMatcherFactory =
            (lineType: LineType) => ({
                testLine: (line: TextLine) => {
                    const lineInfo = LineIdentifier.identifyLine(line);
                    return {
                        success: lineInfo.type === lineType,
                        data: lineInfo
                    };
                }
            });

        //Finds nearest date declaration
        reader.jumpTo(lineNumber);
        let dateRes = reader.searchLine(-1, lineMatcherFactory(LineType.Date));

        //Finds nearest show title declaration
        reader.jumpTo(lineNumber);
        let showTitleRes = reader.searchLine(-1, lineMatcherFactory(LineType.ShowTitle));

        //Finds nearest watch entry declaration
        reader.jumpTo(lineNumber);
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

        let currShowTitle = (showTitleRes.data as ShowTitleLineInfo).params.showTitle;
        let currDate = (dateRes.data as DateLineInfo).params.date;

        let lastWatchEntry: WatchEntry | undefined;

        if (watchEntryRes.success && watchEntryRes.data.type === LineType.WatchEntry) {
            lastWatchEntry = {
                showTitle: currShowTitle,
                startTime: watchEntryRes.data.params.startTime,
                endTime: watchEntryRes.data.params.endTime,
                episode: watchEntryRes.data.params.episode,
                lineNumber: watchEntryRes.data.line.lineNumber,
                company: watchEntryRes.data.params.friends,
            };
        }

        let context: LineContext = {
            currShowTitle,
            currDate,
            currTags: [],
            // lastWatchEntry,
        };

        return {
            valid: true,
            context
        };
    }

    

}