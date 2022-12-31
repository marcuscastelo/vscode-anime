import { Tag } from "./core/tag";

type WatchEntryBase = {
	showTitle: string,
	startTime: string,
	endTime: string,
	company: string[], //Friends
	episode: number,
};

export type WatchEntry = CompleteWatchEntry | PartialWatchEntry;

export type CompleteWatchEntry = WatchEntryBase & {
	partial: false,
};

export type PartialWatchEntry = WatchEntryBase & {
	partial: true,
};

export type DocumentContexted<T> = {
	data: T,
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