/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */
import { Err, Ok, Result, Option, equip } from "rustic";
import { WatchEntry, Tag } from "../../types";
import { Show } from "./cached-shows";

type ShowDict = {
	[name: string]: Show | undefined
};

export default class ShowStorage {
	private showDict: ShowDict = {};
	private friendList: string[] = [];

	public registerShow(declarationLine: number, title: string, tags: Tag[] = [], overwrite = true): Result<Show, Error> {
		if (!overwrite && this.isShowRegistered(title)) {
			return Err(new Error(`Anime already registered: ${title}`));
		}

		let show = new Show(declarationLine, { title, tags });
		this.showDict[title] = show;
		return Ok(show);
	}

	public registerFriend(friendName: string) {
		if (this.friendList.indexOf(friendName) === -1)
			this.friendList.push(friendName);
	}

	public searchShow(showName: string): Option<Show> {
		return this.showDict[showName];
	}

	public getOrCreateShow(showTitle: string, currentLine: number, animeTagsAtCreation: Tag[] = []): Result<Show, Error> {
		const get = () => equip(this.searchShow(showTitle));
		const create = () => this.registerShow(currentLine, showTitle, animeTagsAtCreation);

		return get().mapOrElse(create, (show) => Ok(show));
	}

	public isShowRegistered(showTitle: string): boolean {
		return equip(this.searchShow(showTitle)).isSome();
	}

	public registerWatchEntry(showTitle: string, watchEntry: WatchEntry): Option<Error> {
		const searchRes = equip(this.searchShow(showTitle));

		if (searchRes.isSome()) {
			searchRes.unwrap().updateLastWatchEntry(watchEntry);
			return null;
		}

		return new Error(`Trying to add watch entry to unkown Show: \n` +
			`Show: ${showTitle} \n` +
			`Entry: ${watchEntry}`
		);
	}

	public listShows() {
		return Object.keys(this.showDict);
	}

	public listFriends() {
		return [...this.friendList];
	}
}