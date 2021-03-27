import { TextLine } from "vscode";
import { Tag } from "../types";
import { COMMENT_TOKEN, DATE_REG, LineType, SHOW_TITLE_REG, TAG_REG, WATCH_REG } from "./lineTypes";

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
            tag: Tag
        }
    };

export default class LineInfoParser {
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
                params: { showTitle: groups["1"] },
                line,
            };
        }
        groups = DATE_REG.exec(text);
        if (groups) {
            return {
                type: LineType.Date,
                params: { date: groups["1"] },
                line,
            };
        }

        groups = WATCH_REG.exec(text);
        if (groups) {
            let errors = [];
            if (groups["1"] === undefined) errors.push('Missing startTime');
            if (groups["2"] === undefined) errors.push('Missing endTime');
            if (groups["3"] === undefined) errors.push('Missing episode number')
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
                    startTime: groups["1"],
                    endTime: groups["2"],
                    episode: parseInt(groups["3"]),
                    friends: (groups["4"]) ? (groups["4"] as string).split(',').map(name => name.trim()) : [],
                },
                line,
            };
        }

        groups = TAG_REG.exec(text);
        if (groups) {
            return {
                type: LineType.Tag,
                params: { tag: groups["1"] },
                line,
            };
        }

        if (text === '') {
            return {
                type: LineType.Ignored,
                line,
            }
        }

        return {
            type: LineType.Invalid,
            error: new Error('Invalid line'),
            line,
        };
    }

}