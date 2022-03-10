"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const document_reader_1 = require("../utils/document-reader");
const line_info_parser_1 = require("./line-info-parser");
const line_type_1 = require("./line-type");
class LineContextFinder {
    static findContext(document, lineNumber) {
        let reader = new document_reader_1.default(document);
        reader.jumpTo(lineNumber);
        const lineMatcherFactory = (lineType) => ({
            testLine: (line) => {
                const lineInfo = line_info_parser_1.default.identifyLine(line);
                return {
                    success: lineInfo.type == lineType,
                    data: lineInfo
                };
            }
        });
        //Finds nearest date declaration
        let dateRes = reader.searchLine(-1, lineMatcherFactory(line_type_1.LineType.Date));
        reader.jumpTo(lineNumber);
        //Finds nearest show title declaration
        let showTitleRes = reader.searchLine(-1, lineMatcherFactory(line_type_1.LineType.ShowTitle));
        reader.jumpTo(lineNumber);
        //Finds nearest watch entry declaration
        let watchEntryRes = reader.searchLine(-1, lineMatcherFactory(line_type_1.LineType.WatchEntry));
        reader.jumpTo(lineNumber);
        if (!showTitleRes.success || !dateRes.success) {
            return {
                valid: false,
                error: new Error(`Undefined context:` +
                    `\n\tLast ShowTitle: ${showTitleRes.success ? showTitleRes.data.line.lineNumber : 'Not Found'},` +
                    `\n\tLast Date: ${dateRes.success ? dateRes.data.line.lineNumber : 'Not Found'}`),
            };
        }
        let currentShowTitle = showTitleRes.data.params.showTitle;
        let currentDate = dateRes.data.params.date;
        let lastWatchEntry;
        if (watchEntryRes.success && watchEntryRes.data.type === line_type_1.LineType.WatchEntry) {
            lastWatchEntry = {
                showTitle: currentShowTitle,
                startTime: watchEntryRes.data.params.startTime,
                endTime: watchEntryRes.data.params.endTime,
                episode: watchEntryRes.data.params.episode,
                lineNumber: watchEntryRes.data.line.lineNumber,
                company: watchEntryRes.data.params.friends,
            };
        }
        let context = {
            currentShowTitle,
            currentDate,
            lastWatchEntry,
        };
        return {
            valid: true,
            context
        };
    }
}
exports.default = LineContextFinder;
//# sourceMappingURL=line-context-finder.js.map