/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */
import { WatchEntry, Tag } from "../../types";
import { Show } from "./shows";

type ShowDict = {
	[name: string]: Show | undefined
};

export default class ShowStorage {
	private showDict: ShowDict = {};
	private friendList: string[] = [];

	public registerAnime(title: string, tags: Tag[] = [], overwrite = true): Show {
		if (!overwrite && this.isShowRegistered(title)) {
			console.warn(`Not registering already registered anime: `, title);
			return this.getShow(title) as Show;
		}

		let anime = new Show({title, tags});
		this.showDict[title] = anime;
		return anime;
	}

	public registerFriend(friendName: string) {
		if (this.friendList.indexOf(friendName) === -1)
			this.friendList.push(friendName);
	}

	public getShow(animeName: string): Show | undefined {
		const show = this.showDict[animeName];
		return show;
	}

	public getOrCreateShow(animeName: string, animeTagsAtCreation: Tag[] = []): Show {
		return this.getShow(animeName) ?? this.registerAnime(animeName, animeTagsAtCreation);
	}

	public isShowRegistered(animeName: string): boolean {
		return this.getShow(animeName) !== null;
	}

	public registerWatchEntry(animeName: string, watchEntry: WatchEntry) {
		let show = this.getShow(animeName);
		if (show) {
			show.updateLastWatchEntry(watchEntry);
		}
		else {
			console.error(`Trying to add watch entry to unkown anime: \n\
			Anime: ${animeName} \n\
			Entry: ${watchEntry}`);
		}

	}

	public listShows() {
		return Object.keys(this.showDict);
	}

	public listFriends() {
		return [...this.friendList];
	}
}