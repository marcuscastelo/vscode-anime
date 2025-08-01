import {
	type DateLineInfo,
	type ShowTitleLineInfo,
	type TagLineInfo,
	type WatchEntryLineInfo,
} from './line-info';

type LineContext = {
	currentDateLine: DateLineInfo;
	currentShowLine: ShowTitleLineInfo;
	currentTagsLines: TagLineInfo[];
	lastWatchEntryLine?: WatchEntryLineInfo;
};
export default LineContext;
