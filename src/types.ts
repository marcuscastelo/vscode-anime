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
	"WEBTOON": {
		name: 'WEBTOON',
		target: TagTarget.SHOW,
		parameters: []
	},
	"DORAMA": {
		name: 'DORAMA',
		target: TagTarget.SHOW,
		parameters: []
	},
	"COURSE": {
		name: 'COURSE',
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
	lineNumber: number,
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