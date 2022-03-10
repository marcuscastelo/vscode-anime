/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */

export enum TagApplyInfo {
	WATCH_LINE = 1, // such as [EPISODE-ORDER-VIOLATION]
	WATCH_SESSION, // such as [REWATCH]
	SCRIPT_TAG, //such as [SCRIPT-SKIP(count=100)]
	SHOW, //such as [NOT-ANIME]
}

export type Tag = {
	tagType: string
	appliesTo: TagApplyInfo
	parameters: string[]
};

export const Tags: { [key: string]: Tag } = {
	"NOT-ANIME": {
		tagType: 'NOT-ANIME',
		appliesTo: TagApplyInfo.SHOW,
		parameters: []
	},
	"NOT-IN-MAL": {
		tagType: 'NOT-IN-MAL',
		appliesTo: TagApplyInfo.SHOW,
		parameters: []
	},
	"勉強": {
		tagType: '勉強',
		appliesTo: TagApplyInfo.WATCH_SESSION,
		parameters: [],
	},
	"SCRIPT-SKIP": {
		tagType: 'SCRIPT-SKIP',
		appliesTo: TagApplyInfo.SCRIPT_TAG,
		parameters: [ 'count' ]
	},
	"REWATCH": {
		tagType: 'REWATCH',
		appliesTo: TagApplyInfo.SHOW,
		parameters: []
	},
	"UNSAFE-ORDER": {
		tagType: 'UNSAFE-ORDER',
		appliesTo: TagApplyInfo.WATCH_LINE,
		parameters: []
	},
	"MANGA": {
		tagType: 'MANGA',
		appliesTo: TagApplyInfo.SHOW,
		parameters: []
	},
};

export type WatchEntry = {
	showTitle: string,
	startTime: string,
	endTime: string,
	episode: number,
	company: string[], //Friends
	lineNumber: number,
};

export type WatchSession = {
	startLine: number,
	entries: WatchEntry[],
	tags: Tag[]
};

export type AnimeSearchResultItem = {
	mal_id: number,
	url: string,
	image_url: string,
	title: string,
	airing: boolean,
	synopsis: string,
	type: string,
	episodes: number,
	score: number,
	start_date: string,
	end_date: string,
	members: number,
	rated: string
};