import { TextLine } from "vscode";
import { MarucsAnime } from "../extension";
import { LineInfo, TagParam } from "./line-info";
import { COMMENT_TOKEN, DATE_REG, LineType, SHOW_TITLE_REG, TAG_PARAM_REG, TAG_REG, WATCH_REG } from "./line-type";
import LineUtils from "./line-utils";

export default class LineIdentifier {
    /**
     * Identifies the line type and returns the line info
     * @param line line to be identified
     * @returns line info with the line type and the line params
     */
    public static identifyLine(line: TextLine): LineInfo {
        let text = line.text;
        text = LineUtils.removeComment(text);

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
        if (groups[3] === undefined) { errors.push('WatchEntry: Missing episode declaration'); }

        // //TODO: validar em outro lugar (line-processor?)
        // const validEpisodeReg = /^(0\d{1}|\d{2,}|\-\-)$/;
        // if (!validEpisodeReg.test(groups[3])) { 
        //     errors.push('WatchEntry: Missing leading zeros in episode number'); 
        // }

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
                episode: groups[3],
                company: (groups[4]) ? (groups[4] as string).split(',').map(name => name.trim()) : [],
            },
            line,
        };
    }

    private static getTagParams(line: TextLine, groups: RegExpExecArray): LineInfo {

        let [_, tagName, tagParamsStr] = groups;
        tagName = tagName.trim();

        let tagParams: TagParam[];
        //Assumes valid unless proven wrong below
        let parametersValid = true;

        if (!tagParamsStr || tagParamsStr.trim() === '') {
            tagParams = [];
        }
        else {
            tagParams = tagParamsStr.split(',').map((paramStr) => {
                let execResult = TAG_PARAM_REG.exec(paramStr);
                if (!execResult) {
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

        const tag = MarucsAnime.INSTANCE.tagRegistry.get(tagName);

        if (!tag) {
            return {
                type: LineType.Invalid,
                errors: [`Tag: Tag '${tagName}' not registered`],
                line,
            };
        }

        return {
            type: LineType.Tag,
            params: {
                tag,
                tagName,
                tagParams
            },
            line,
        };
    }
};