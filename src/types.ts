import { Tag } from "./core/tag";
import { CompleteEpisodeSpecification, EpisodeSpecification, PartialEpisodeSpecification } from "./core/episode-specification";

type WatchEntryBase = {
	showTitle: string,
	startTime: string,
	endTime: string,
	company: string[], //Friends
	episodeSpec: CompleteEpisodeSpecification | PartialEpisodeSpecification,
};

export type WatchEntry = CompleteWatchEntry | PartialWatchEntry;

export type CompleteWatchEntry = WatchEntryBase & {
	partial: false,
	episodeSpec: CompleteEpisodeSpecification
};

export type PartialWatchEntry = WatchEntryBase & {
	partial: true,
	episodeSpec: PartialEpisodeSpecification
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