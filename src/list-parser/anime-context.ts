import ShowStorage from "../cache/anime/showStorage";
import { Tag, TagTarget, WatchEntry } from "../types";

export default class ListContext {
    currDate: string = '';
    currShowName: string = '';
    currTags: Tag[] = [];
}