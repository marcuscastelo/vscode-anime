/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */
import { Err, Ok, Result, Option, equip } from "rustic";
import { Registry } from "../../core/registry/registry";
import { Tag } from "../../core/tag";
import { WatchEntry } from "../../types";
import { Show } from "./cached-shows";
import { DocumentContexted as DocumentContexted } from "../../types";

/**
 * TODO: separar em 2 classes: ShowStorage e FriendStorage
 * TODO: ver onde colocar o "registerWatchEntry"
 */
export default class ShowStorage extends Registry<Show> {
	private get showDict() {
		return this._registry;
	}

	private friendList: string[] = [];

	public registerShow(declarationLine: number, title: string, tags: Tag[] = [], overwrite = true): Result<Show, Error> {
		if (!overwrite && this.isShowRegistered(title)) {
			return Err(new Error(`Anime already registered: ${title}`));
		}

		let show = new Show(declarationLine, { title, tags });
		this.showDict.set(title, show);
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
		return this.showDict.get(showName);
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

	public registerWatchEntry(showTitle: string, watchEntryCtx: DocumentContexted<WatchEntry>): Result<undefined, Error> {
		const searchRes = equip(this.searchShow(showTitle));

		const watchEntry = watchEntryCtx.data;
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
			searchRes.unwrap().addWatchEntry(watchEntryCtx);
			return Ok(undefined);
		}

		return Err(new Error(`Trying to add watch entry to unkown Show: \n` +
			`Show: ${showTitle} \n` +
			`Entry: ${JSON.stringify(watchEntryCtx.data)}`
		));
	}

	public listShows() {
		return Array.from(this.showDict.keys());
	}

	public listFriends() {
		return [...this.friendList];
	}
}