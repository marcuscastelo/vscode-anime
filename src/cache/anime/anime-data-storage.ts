/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */
import { WatchEntry } from "../../types";
import Anime from "./anime";

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

		let anime = new Anime(animeName);
		this.animeDict[animeName] = anime;
		return anime;
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
			anime.updateLastWatchedEpisode(entry.episode, entry.line);
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