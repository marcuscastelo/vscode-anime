/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */
import { Err, Ok, Result, Option, equip, ResultErr } from "rustic";
import { WatchEntry, Tag } from "../../types";
import { Show } from "./cached-shows";

type ShowDict = {
	[name: string]: Show | undefined
};

/**
 * TODO: separar em 2 classes: ShowStorage e FriendStorage
 * TODO: ver onde colocar o "registerWatchEntry"
 */
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

	public registerFriend(friendName: string): Result<undefined, Error> {
		if (this.friendList.indexOf(friendName) !== -1) {
			return Err(new Error(`Friend already registered: ${friendName}`));
		}

		this.friendList.push(friendName);
		return Ok(undefined);
	}

	public searchShow(showName: string): Option<Show> {
		return this.showDict[showName];
	}

	public searchFriend(friendName: string): Option<string> {
		return this.friendList.find((friend) => friend === friendName);
	}

	//TODO: refatorar (pq currentLine aqui, mas declarationLine no registerShow?)
	public getOrCreateShow(showTitle: string, currentLine: number, animeTagsAtCreation: Tag[] = []): Result<Show, Error> {
		const get = () => equip(this.searchShow(showTitle));
		const create = () => this.registerShow(currentLine, showTitle, animeTagsAtCreation);

		return get().mapOrElse(create, (show) => Ok(show));
	}

	public isShowRegistered(showTitle: string): boolean {
		return equip(this.searchShow(showTitle)).isSome();
	}

	public isFriendRegistered(friendName: string): boolean {
		return equip(this.searchFriend(friendName)).isSome();
	}

	public registerWatchEntry(showTitle: string, watchEntry: WatchEntry): Result<undefined, Error> {
		const searchRes = equip(this.searchShow(showTitle));

		if (showTitle !== watchEntry.showTitle) {
			return Err(new Error(`Show title mismatch: \n` +
				`Show: ${showTitle} \n` +
				`Entry: ${watchEntry.showTitle}`
			));
		}

		const notRegisteredFriends = watchEntry.company
			.filter((friend) => !this.isFriendRegistered(friend));

		if (notRegisteredFriends.length > 0) {
			return Err(new Error(`Trying to add watch entry with unkown friends: \n` +
				`Show: ${showTitle} \n` +
				`Friends: ${watchEntry.company.join(", ")}` +
				`Unregistered Friends: ${notRegisteredFriends.join(", ")}`
			));
		}

		if (searchRes.isSome()) {
			searchRes.unwrap().updateLastWatchEntry(watchEntry);
			return Ok(undefined);
		}

		return Err(new Error(`Trying to add watch entry to unkown Show: \n` +
			`Show: ${showTitle} \n` +
			`Entry: ${watchEntry}`
		));
	}

	public listShows() {
		return Object.keys(this.showDict);
	}

	public listFriends() {
		return [...this.friendList];
	}
}