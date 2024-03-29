import { utils } from "mocha";
import { Tag } from "../../core/tag";
import { MAL } from "../../services/mal";
import { CompleteWatchEntry, DocumentContexted, WatchEntry } from "../../types";

type ShowInfo = {
    title: string,
    watchEntries: DocumentContexted<WatchEntry>[],
    lastMentionedLine: number,
    firstMentionedLine: number,
    tags: Tag[]

    get lastCompleteWatchEntry(): DocumentContexted<CompleteWatchEntry> | undefined;
};

type MALAnimeInfo = {
    mal_id: number,
    title: string,
    url: string,
    image_url: string,
    type: string,
    episodes: number,
};

export class Show {
    public info: ShowInfo;
    constructor(declarationLine: number, initializer: ShowInfo | { title: string, tags?: Tag[] }) {
        const {
            title,
            lastMentionedLine,
            watchEntries,
            tags
        } = initializer as ShowInfo;

        this.info = {
            title,
            lastMentionedLine: lastMentionedLine ?? declarationLine,
            watchEntries: watchEntries ?? [],
            firstMentionedLine: declarationLine,
            tags: tags ?? [],

            get lastCompleteWatchEntry() {
                const a = Array.from(this.watchEntries).reverse().find(w => w.data.partial === false);
                return a as DocumentContexted<CompleteWatchEntry> | undefined; //TODO: type guard
            }
        };
    }

    public updateLastMentionedLine(lineNumber: number) {
        this.info.lastMentionedLine = lineNumber;
    }

    public addWatchEntry(lastEntryCtx: DocumentContexted<WatchEntry>) {
        this.info.watchEntries.push(lastEntryCtx);
        this.info.lastMentionedLine = lastEntryCtx.lineNumber;
    }
}

interface MALSearchable<T> {
    searchMALInfo(): Promise<T>;
}

export abstract class MALShow<T> extends Show implements MALSearchable<T> {
    cachedMALInfo?: {
        lastUpdateMs: number,
        data: T
    };

    async getMALInfo(): Promise<T> {
        const cacheTimeExpirationMs = 24 * 60 * 60 * 1000; //1 day in milliseconds

        if (!this.cachedMALInfo || (Date.now() - this.cachedMALInfo.lastUpdateMs) > cacheTimeExpirationMs) {
            this.cachedMALInfo = {
                lastUpdateMs: Date.now(),
                data: await this.searchMALInfo()
            };
        }

        return this.cachedMALInfo.data;
    }

    abstract searchMALInfo(): Promise<any>;

}

export class Manga extends MALShow<never> {
    cachedMALInfo?: { lastUpdateMs: number; data: never; } | undefined;
    searchMALInfo(): Promise<never> {
        throw new Error("Method not implemented.");
    }
}

export class Anime extends MALShow<MALAnimeInfo> {
    cachedMALInfo?: { lastUpdateMs: number; data: MALAnimeInfo; } | undefined;
    async searchMALInfo(): Promise<MALAnimeInfo> {
        const result = await MAL.searchAnime(this.info.title);
        if (result.length > 0) {
            return result[0] as MALAnimeInfo;
        }

        throw new Error('Anime Not found');
    }
}