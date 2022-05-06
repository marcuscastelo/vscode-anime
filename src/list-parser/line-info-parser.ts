import { TextLine } from "vscode";
import { Tag } from "../types";
import { COMMENT_TOKEN, DATE_REG, LineType, SHOW_TITLE_REG, TAG_PARAM_REG, TAG_REG, WATCH_REG } from "./line-type";

type LineInfoBase = {
    line: TextLine,
};

export type LineInfo =
    LineInfoBase & (
        | { type: LineType.Date } & DateLineInfo
        | { type: LineType.ShowTitle } & ShowTitleLineInfo
        | { type: LineType.WatchEntry } & WatchEntryLineInfo
        | { type: LineType.Tag } & TagLineInfo
        | { type: LineType.Ignored }
        | { type: LineType.Invalid, errors: string[] }
    );

export type ShowTitleLineInfo =
    LineInfoBase &
    {
        params: {
            showTitle: string
        }
    };

export type WatchEntryLineInfo =
    LineInfoBase &
    {
        params: {
            startTime: string,
            endTime: string,
            episode: number,
            friends: string[],
        }
    };

export type DateLineInfo =
    LineInfoBase &
    {
        params: {
            date: string
        }
    };

type TagParam = {
    name: string,
    value: string,
};

export type TagLineInfo =
    LineInfoBase &
    {
        params: {
            tagName: string,
            tagParams: TagParam[],
        }
    };

export default class LineIdentifier {
    public static identifyLine(line: TextLine): LineInfo {
        let text = line.text;

        let commentTokenPosition = text.indexOf(COMMENT_TOKEN);
        if (commentTokenPosition !== -1) {
            text = text.substring(0, commentTokenPosition);
        }

        //Checks if empty line before regex for performance
        if (text === '') {
            return {
                type: LineType.Ignored,
                line,
            };
        }

        //Redirecting to other methods according to line type 
        let execArray: RegExpExecArray | null;

        execArray = SHOW_TITLE_REG.exec(text);
        if (execArray) { return this.getShowTitleParams(line, execArray); }

        execArray = DATE_REG.exec(text);
        if (execArray) { return this.getDateParams(line, execArray); }

        execArray = WATCH_REG.exec(text);
        if (execArray) { return this.getWatchEntryParams(line, execArray); }

        execArray = TAG_REG.exec(text);
        if (execArray) { return this.getTagParams(line, execArray); }

        //TODO: return errors in a meaningful way to show on diagnostics
        return {
            type: LineType.Invalid,
            errors: ['LineType: Unkown line type'],
            line,
        };
    }

    private static getShowTitleParams(line: TextLine, groups: RegExpExecArray): LineInfo {
        return {
            type: LineType.ShowTitle,
            params: { showTitle: groups[1] },
            line,
        };
    }

    private static getDateParams(line: TextLine, groups: RegExpExecArray): LineInfo {
        return {
            type: LineType.Date,
            params: { date: groups[1] },
            line,
        };
    }

    private static getWatchEntryParams(line: TextLine, groups: RegExpExecArray): LineInfo {
        let errors = [];
        if (groups[1] === undefined) { errors.push('WatchEntry: Missing startTime'); } 
        if (groups[2] === undefined) { errors.push('WatchEntry: Missing endTime'); } 
        if (groups[3] === undefined) { errors.push('WatchEntry: Missing episode number'); }
        //TODO: check if episode number is at least 2-dig

        if (errors.length > 0) {
            return {
                type: LineType.Invalid,
                line,
                errors,
            };
        }

        return {
            type: LineType.WatchEntry,
            params: {
                startTime: groups[1],
                endTime: groups[2],
                episode: parseInt(groups[3]),
                friends: (groups[4]) ? (groups[4] as string).split(',').map(name => name.trim()) : [],
            },
            line,
        };
    }

    private static getTagParams(line: TextLine, groups: RegExpExecArray): LineInfo {

        let [_, tagName, tagParamsStr] = groups;

        let tagParams: TagParam[];
        //Assumes valid unless proven wrong below
        let parametersValid = true;

        if (!tagParamsStr || tagParamsStr.trim() === '') {
            tagParams = [];
        }
        else {
            tagParams = tagParamsStr.split(',').map((paramStr) => {
                let execResult = TAG_PARAM_REG.exec(paramStr);
                if (execResult == null) { //TODO: strict check (===)
                    parametersValid = false;
                    return <TagParam>{};
                }
                let [_, name, value] = execResult;
                return { name, value } as TagParam;
            });
        }

        if (!parametersValid) {
            return {
                type: LineType.Invalid,
                errors: ['Tag: Invalid parameter/parameters'],
                line,
            };
        }

        return {
            type: LineType.Tag,
            params: {
                tagName,
                tagParams
            },
            line,
        };
    }
};