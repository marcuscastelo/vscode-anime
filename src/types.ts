import { Tag } from "./core/tag";

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