import { DateLineInfo, ShowTitleLineInfo, TagLineInfo, WatchEntryLineInfo } from "./line-info";

export default interface LineContext {
    currentDateLine: DateLineInfo;
    currentShowLine: ShowTitleLineInfo;
    currentTagsLines: TagLineInfo[];
    lastWatchEntryLine?: WatchEntryLineInfo;
}