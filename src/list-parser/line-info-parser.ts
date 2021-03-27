import { TextLine } from "vscode";
import { Tag } from "../types";
import { COMMENT_TOKEN, DATE_REG, LineType, SHOW_TITLE_REG, TAG_REG, WATCH_REG } from "./line-type";

type LineInfoBase = {
    line: TextLine,
}

export type LineInfo =
    LineInfoBase & (
        | { type: LineType.Date } & DateLineInfo
        | { type: LineType.ShowTitle } & ShowTitleLineInfo
        | { type: LineType.WatchEntry } & WatchEntryLineInfo
        | { type: LineType.Tag } & TagLineInfo
        | { type: LineType.Ignored }
        | { type: LineType.Invalid, error: Error }
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

export type TagLineInfo =
    LineInfoBase &
    {
        params: {
            tagName: string
        }
    };

export default class LineInfoParser {
    public static parseLineInfo(line: TextLine): LineInfo {
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
            }
        }
        
        //Redirecting to other methods according to line type 
        let execArray: RegExpExecArray | null;

        execArray = SHOW_TITLE_REG.exec(text);
        if (execArray) return this.parseShowTitleLine(line, execArray);

        execArray = DATE_REG.exec(text);
        if (execArray) return this.parseDateLine(line, execArray);

        execArray = WATCH_REG.exec(text);
        if (execArray) return this.parseWatchEntryLine(line, execArray);

        execArray = TAG_REG.exec(text);
        if (execArray) return this.parseTagLine(line, execArray);

        return {
            type: LineType.Invalid,
            error: new Error('Invalid line type'),
            line,
        };
    }

    private static parseShowTitleLine(line: TextLine, groups: RegExpExecArray): LineInfo {
        return {
            type: LineType.ShowTitle,
            params: { showTitle: groups[1] },
            line,
        };
    }

    private static parseDateLine(line: TextLine, groups: RegExpExecArray): LineInfo {
        return {
            type: LineType.Date,
            params: { date: groups[1] },
            line,
        };
    }

    private static parseWatchEntryLine(line: TextLine, groups: RegExpExecArray): LineInfo {
        let errors = [];
        if (groups[1] === undefined) errors.push('Missing startTime');
        if (groups[2] === undefined) errors.push('Missing endTime');
        if (groups[3] === undefined) errors.push('Missing episode number')
        //TODO: check if episode number is at least 2-dig

        if (errors.length > 0) {
            return {
                type: LineType.Invalid,
                line,
                error: new Error(errors.reduce((accum, next) => accum + next)),
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

    private static parseTagLine(line: TextLine, groups: RegExpExecArray): LineInfo {

        return {
            type: LineType.Tag,
            params: { tagName: groups[1] },
            line,

        }


    }
};