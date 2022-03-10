"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const line_type_1 = require("./line-type");
class LineIdentifier {
    static identifyLine(line) {
        let text = line.text;
        let commentTokenPosition = text.indexOf(line_type_1.COMMENT_TOKEN);
        if (commentTokenPosition !== -1) {
            text = text.substring(0, commentTokenPosition);
        }
        //Checks if empty line before regex for performance
        if (text === '') {
            return {
                type: line_type_1.LineType.Ignored,
                line,
            };
        }
        //Redirecting to other methods according to line type 
        let execArray;
        execArray = line_type_1.SHOW_TITLE_REG.exec(text);
        if (execArray)
            return this.getShowTitleParams(line, execArray);
        execArray = line_type_1.DATE_REG.exec(text);
        if (execArray)
            return this.getDateParams(line, execArray);
        execArray = line_type_1.WATCH_REG.exec(text);
        if (execArray)
            return this.getWatchEntryParams(line, execArray);
        execArray = line_type_1.TAG_REG.exec(text);
        if (execArray)
            return this.getTagParams(line, execArray);
        //TODO: return errors in a meaningful way to show on diagnostics
        return {
            type: line_type_1.LineType.Invalid,
            errors: ['LineType: Unkown line type'],
            line,
        };
    }
    static getShowTitleParams(line, groups) {
        return {
            type: line_type_1.LineType.ShowTitle,
            params: { showTitle: groups[1] },
            line,
        };
    }
    static getDateParams(line, groups) {
        return {
            type: line_type_1.LineType.Date,
            params: { date: groups[1] },
            line,
        };
    }
    static getWatchEntryParams(line, groups) {
        let errors = [];
        if (groups[1] === undefined)
            errors.push('WatchEntry: Missing startTime');
        if (groups[2] === undefined)
            errors.push('WatchEntry: Missing endTime');
        if (groups[3] === undefined)
            errors.push('WatchEntry: Missing episode number');
        //TODO: check if episode number is at least 2-dig
        if (errors.length > 0) {
            return {
                type: line_type_1.LineType.Invalid,
                line,
                errors,
            };
        }
        return {
            type: line_type_1.LineType.WatchEntry,
            params: {
                startTime: groups[1],
                endTime: groups[2],
                episode: parseInt(groups[3]),
                friends: (groups[4]) ? groups[4].split(',').map(name => name.trim()) : [],
            },
            line,
        };
    }
    static getTagParams(line, groups) {
        let [_, tagName, tagParamsStr] = groups;
        let tagParams;
        //Assumes valid unless proven wrong below
        let parametersValid = true;
        if (!tagParamsStr || tagParamsStr.trim() === '')
            tagParams = [];
        else
            tagParams = tagParamsStr.split(',').map((paramStr) => {
                let execResult = line_type_1.TAG_PARAM_REG.exec(paramStr);
                if (execResult == null) {
                    parametersValid = false;
                    return {};
                }
                let [_, name, value] = execResult;
                return { name, value };
            });
        if (!parametersValid) {
            return {
                type: line_type_1.LineType.Invalid,
                errors: ['Tag: Invalid parameter/parameters'],
                line,
            };
        }
        return {
            type: line_type_1.LineType.Tag,
            params: {
                tagName,
                tagParams
            },
            line,
        };
    }
}
exports.default = LineIdentifier;
;
//# sourceMappingURL=line-info-parser.js.map