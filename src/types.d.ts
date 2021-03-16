/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */

export enum TagApplyInfo {
	WATCH_LINE, // such as [EPISODE-ORDER-VIOLATION]
	WATCH_SESSION, // such as [REWATCH]
	SCRIPT_TAG, //such as [SKIP-LINES=100]
}

export type Tag = {
	tagType: string
	appliesTo: TagApplyInfo
	parameters: string[]
};

export type Anime = {
	name: string,
	lastEp: number,
	lastLine: number,
};

export type WatchEntry = {
	animeName: string,
	startTime: string,
	endTime: string,
	episode: number
};

export type WatchSession = {
	startLine: number,
	entries: WatchEntry[],
	tags: Tag[]
};