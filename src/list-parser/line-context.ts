import ShowStorage from "../cache/anime/showStorage";
import { Tag, TagTarget, WatchEntry } from "../types";

export default class LineContext {
    currDate: string = '';
    currShowTitle: string = '';
    currTags: Tag[] = [];
}