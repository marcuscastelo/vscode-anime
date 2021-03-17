/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */
import { Anime, WatchEntry } from "./types";

type AnimeDict = {
	[name: string]: Anime
};

export default class AnimeDataStorage {
	animeDict: AnimeDict;
	friendList: string[];
	constructor() {
		this.animeDict = {};
		this.friendList = [];
	}

	registerAnime(animeName: string, overwrite = true): Anime {
		if (!overwrite && this.isAnimeRegistered(animeName)) {
			console.warn(`Not registering already registered anime: `, animeName);
			return this.getAnime(animeName) as Anime;
		}

		return this.animeDict[animeName] = {
			name: animeName,
			lastEp: 0,
			lastLine: -1,
		};
	}

	registerFriend(friendName: string) {
		if (this.friendList.indexOf(friendName) === -1)
			this.friendList.push(friendName);
	}

	getAnime(animeName: string): Anime | null {
		return this.animeDict[animeName];
	}

	getOrCreateAnime(animeName: string): Anime {
		return this.getAnime(animeName) ?? this.registerAnime(animeName);
	}

	isAnimeRegistered(animeName: string): boolean {
		return this.getAnime(animeName) !== null;
	}

	addWatchEntry(animeName: string, entry: WatchEntry) {
		let anime = this.getAnime(animeName);
		if (anime) {
			anime.lastEp = entry.episode;
		}
		else {
			console.error(`Trying to add watch entry to unkown anime: \n\
			Anime: ${animeName} \n\
			Entry: ${entry}`);
		}

	}

	listAnimes() {
		return Object.keys(this.animeDict);
	}

	listFriends() {
		return [...this.friendList];
	}
}