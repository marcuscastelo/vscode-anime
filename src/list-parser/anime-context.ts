import { Tag, WatchEntry } from "../types";

export default class ListContext {
    currDate: string = '';
    currShowName: string = '';
    currTags: Tag[] = [];

    public onTag(tag: Tag) {

    }

    public onShowTitle(showTitle: string) {

    }

    public onWatchEntry(watchEntry: WatchEntry) {

    }

}