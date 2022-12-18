import { Tag, TagTarget, WatchEntry } from "../types";
import { DateLineInfo, ShowTitleLineInfo, TagLineInfo, WatchEntryLineInfo } from "./line-info-parser";

export default interface LineContext {
    currentDateLine: DateLineInfo;
    currentShowLine: ShowTitleLineInfo;
    currentTagsLines: TagLineInfo[];
    lastWatchEntryLine?: WatchEntryLineInfo;
}