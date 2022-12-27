import { TextDocument, TextLine } from "vscode";
import { Show } from "../cache/anime/shows";
import LineContext from "../list-parser/line-context";
import LineContextFinder from "../list-parser/line-context-finder";
import { DateLineInfo, ShowTitleLineInfo, TagLineInfo, WatchEntryLineInfo } from "../list-parser/line-info";
import { Tag, TagTarget } from "../types";
import { Result } from "../utils/typescript-utils";

//TODO: move
type LineAddressable = number | TextLine | LineContext;
//TODO: move
function isNumber(arg: any): arg is number {
    return typeof arg === 'number';
}

//TODO: move
function isTextLine(arg: any): arg is TextLine {
    const tl = arg as TextLine;
    return tl.lineNumber !== undefined && tl.text !== undefined;
}

//TODO: move
function isLineContext(arg: any): arg is LineContext {
    const lc = arg as LineContext;
    return lc.currentShowLine !== undefined && lc.currentTagsLines !== undefined;
}

//TODO: move
function isLineAddressable(arg: any): arg is LineAddressable {
    return isNumber(arg) || isTextLine(arg) || isLineContext(arg);
}

//TODO: move
function lineAddressableToContext(document: TextDocument, line: LineAddressable): LineContext | Error {
    if (isNumber(line)) {
        line = document.lineAt(line);
    }

    if (isTextLine(line)) {
        const contextRes = LineContextFinder.findContext(document, line.lineNumber);
        if (!contextRes.ok) {
            return contextRes.error;
        }
        line = contextRes.result;
    }

    return line;
}

export function checkTags(currTags: Tag[], targetShow: Show) {
    const missingTags = targetShow.info.tags.filter(tag => tag.target === TagTarget.SHOW && !currTags.includes(tag));
    const extraTags = currTags.filter(tag => tag.target === TagTarget.SHOW && !targetShow.info.tags.includes(tag));

    return { missingTags, extraTags };
}