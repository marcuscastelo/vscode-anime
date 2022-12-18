import ShowStorage from "../cache/anime/showStorage";
import { Tag, TagTarget, WatchEntry } from "../types";
import { WatchEntryLineInfo } from "./line-info-parser";

export default class LineContext {
    currDate: string = '';
    currShowTitle: string = '';
    currTags: Tag[] = [];
    lastWatchEntryLine?: WatchEntryLineInfo;
}