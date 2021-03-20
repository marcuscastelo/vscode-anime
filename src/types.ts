/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */

export enum TagApplyInfo {
	WATCH_LINE, // such as [EPISODE-ORDER-VIOLATION]
	WATCH_SESSION, // such as [REWATCH]
	SCRIPT_TAG, //such as [SKIP-LINES=100]
}


export enum LineType {
	AnimeTitle = 1,
	Date,
	Watch,
	Tag,
	Invalid,
	Ignored,
}

export type AnimeContext = {
	currDate: string,
	currAnimeName: string,
	currTag?: Tag
};

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
	episode: number,
	company?: string[], //Friends
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