export enum TagTarget {
	WATCH_LINE = 1, // such as [EPISODE-ORDER-VIOLATION]
	WATCH_SESSION, // such as [REWATCH]
	SCRIPT_TAG, //such as [SCRIPT-SKIP(count=100)]
	SHOW, //such as [NOT-ANIME]
}

export type Tag = {
	name: string
	target: TagTarget
	parameters: string[]
};

export const Tags: { [key: string]: Tag } = {
	"NOT-ANIME": {
		name: 'NOT-ANIME',
		target: TagTarget.SHOW,
		parameters: []
	},
	"NOT-IN-MAL": {
		name: 'NOT-IN-MAL',
		target: TagTarget.SHOW,
		parameters: []
	},
	"勉強": {
		name: '勉強',
		target: TagTarget.WATCH_SESSION,
		parameters: [],
	},
	"SCRIPT-SKIP": {
		name: 'SCRIPT-SKIP',
		target: TagTarget.SCRIPT_TAG,
		parameters: [ 'count' ]
	},
	"REWATCH": {
		name: 'REWATCH',
		target: TagTarget.SHOW,
		parameters: []
	},
	"UNSAFE-ORDER": {
		name: 'UNSAFE-ORDER',
		target: TagTarget.WATCH_LINE,
		parameters: []
	},
	"MANGA": {
		name: 'MANGA',
		target: TagTarget.SHOW,
		parameters: []
	},
};

export type WatchEntry = {
	showTitle: string,
	startTime: string,
	endTime: string,
	episode: number,
	company: string[], //Friends
	lineNumber: number, //TODO: remover?
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