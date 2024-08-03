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

export type ImageURLs = {
	image_url: string,
	small_image_url: string,
	large_image_url: string,
};

export type Date = {
	day: number,
	month: number,
	year: number
};

export type Genre = {
	mal_id: number,
	type: string,
	name: string,
	url: string
};

export type AnimeSearchResultItem = {
	mal_id: number,
	url: string,
	images: {
		jpg: ImageURLs,
		webp: ImageURLs
	},
	trailer?: any,
	approved: boolean,
	titles: {
		type: string,
		title: string
	}[],
	title: string,
	title_english?: string,
	title_japanese?: string,
	title_synonyms: string[],
	type: string,
	source: string,
	episodes: number,
	status: string,
	airing: boolean,
	aired: {
		from: string,
		to: string,
		prop: {
			from: Date,
			to: Date,
		},
		string: string
	},
	duration: string,
	rating?: string,
	score?: number,
	scored_by?: number,
	rank: number,
	popularity: number,
	members: number,
	favorites: number,
	synopsis?: string,
	background?: string,
	season?: string,
	year?: any,
	broadcast?: any,
	genres: Genre[],
	explicit_genres: Genre[],
	themes: Genre[],
	demographics: Genre[],
};