/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */
import { WatchEntry, Tag } from "../../types";
import Anime from "./anime";

type AnimeDict = {
	[name: string]: Anime
};

export default class AnimeDataStorage {
	private animeDict: AnimeDict = {};
	private friendList: string[] = [];

	public registerAnime(animeName: string, animeTags: Tag[] = [], overwrite = true): Anime {
		if (!overwrite && this.isAnimeRegistered(animeName)) {
			console.warn(`Not registering already registered anime: `, animeName);
			return this.getAnime(animeName) as Anime;
		}

		let anime = new Anime(animeName, animeTags);
		this.animeDict[animeName] = anime;
		return anime;
	}

	public registerFriend(friendName: string) {
		if (this.friendList.indexOf(friendName) === -1)
			this.friendList.push(friendName);
	}

	public getAnime(animeName: string): Anime | undefined {
		return this.animeDict[animeName];
	}

	public getOrCreateAnime(animeName: string, animeTagsAtCreation: Tag[] = []): Anime {
		return this.getAnime(animeName) ?? this.registerAnime(animeName, animeTagsAtCreation);
	}

	public isAnimeRegistered(animeName: string): boolean {
		return this.getAnime(animeName) !== null;
	}

	public addWatchEntry(animeName: string, entry: WatchEntry) {
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

	public listAnimes() {
		return Object.keys(this.animeDict);
	}

	public listFriends() {
		return [...this.friendList];
	}
}