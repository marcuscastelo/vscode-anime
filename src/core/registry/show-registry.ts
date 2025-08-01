import { equip, Err, Ok, type Option, type Result } from 'rustic';

import { type DocumentContexted as DocumentContexted, type WatchEntry } from '../../types';
import { type Show, ShowFactory } from '../show';
import { type Tag } from '../tag';
import { Registry } from './registry';

export default class ShowRegistry extends Registry<Show> {
	private get showDict() {
		return this._registry;
	}

	private friendList: string[] = [];

	public registerShow(
		declarationLine: number,
		title: string,
		tags: Tag[] = [],
		overwrite = true
	): Result<Show, Error> {
		if (!overwrite && this.isShowRegistered(title)) {
			return Err(new Error(`Anime already registered: ${title}`));
		}

		const show = ShowFactory.createShow(declarationLine, { title, tags });
		this.showDict.set(title, show);
		return Ok(show);
	}

	public registerFriend(friendName: string) {
		if (this.friendList.indexOf(friendName) === -1) this.friendList.push(friendName);
	}

	public searchShow(showName: string): Option<Show> {
		return this.showDict.get(showName);
	}

	// TODO: Should return readonly data
	public getOrCreateShow(
		showTitle: string,
		currentLine: number,
		animeTagsAtCreation: Tag[] = []
	): Result<Show, Error> {
		const get = () => equip(this.searchShow(showTitle));
		const create = () => this.registerShow(currentLine, showTitle, animeTagsAtCreation);

		return get().mapOrElse(create, show => Ok(show));
	}

	public isShowRegistered(showTitle: string): boolean {
		return equip(this.searchShow(showTitle)).isSome();
	}

	public registerWatchEntry(
		showTitle: string,
		watchEntryCtx: DocumentContexted<WatchEntry>
	): Option<Error> {
		const searchRes = equip(this.searchShow(showTitle));

		if (searchRes.isSome()) {
			const show = searchRes.unwrap();
			show.watchEntries.push(watchEntryCtx);
			show.lastMentionedLine = watchEntryCtx.lineNumber;
			return null;
		}

		return new Error(
			`Trying to add watch entry to unkown Show: \n` +
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
