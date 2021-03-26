import { Tag, WatchEntry } from "../types";

export default class MAList {
    currDate: string = '';
    currShowName: string = '';
    currTags: Tag[] = [];

    public onTagFound(tag: Tag) {

    }

    public onSessionStart(showName: string) {

    }

    public onWatchEntry(watchEntry: WatchEntry) {

    }

}