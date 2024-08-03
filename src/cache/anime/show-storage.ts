/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */
import { Err, Ok, Result, Option, equip } from "rustic";
import { Registry } from "../../core/registry/registry";
import { Tag } from "../../core/tag";
import { DocumentContexted as DocumentContexted, WatchEntry } from "../../types";
import { Show } from "./shows";

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

	public registerFriend(friendName: string) {
		if (this.friendList.indexOf(friendName) === -1)
			this.friendList.push(friendName);
	}

	public searchShow(showName: string): Option<Show> {
		return this.showDict.get(showName);
	}

	public getOrCreateShow(showTitle: string, currentLine: number, animeTagsAtCreation: Tag[] = []): Result<Show, Error> {
		const get = () => equip(this.searchShow(showTitle));
		const create = () => this.registerShow(currentLine, showTitle, animeTagsAtCreation);

		return get().mapOrElse(create, (show) => Ok(show));
	}

	public isShowRegistered(showTitle: string): boolean {
		return equip(this.searchShow(showTitle)).isSome();
	}

	public registerWatchEntry(showTitle: string, watchEntryCtx: DocumentContexted<WatchEntry>): Option<Error> {
		const searchRes = equip(this.searchShow(showTitle));

		if (searchRes.isSome()) {
			searchRes.unwrap().addWatchEntry(watchEntryCtx);
			return null;
		}

		return new Error(`Trying to add watch entry to unkown Show: \n` +
			`Show: ${showTitle} \n` +
			`Entry: ${JSON.stringify(watchEntryCtx.data)}`
		);
	}

	public listShows() {
		return Array.from(this.showDict.keys());
	}

	public iterShows() {
		return this.showDict.values();
	}

	public listFriends() {
		return [...this.friendList];
	}
}