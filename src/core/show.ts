import { Tag } from "./tag";
import { MAL } from "../services/mal";
import { CompleteWatchEntry, DocumentContexted, WatchEntry } from "../types";

export type Show = {
  title: string;
  watchEntries: DocumentContexted<WatchEntry>[];
  lastMentionedLine: number;
  firstMentionedLine: number;
  tags: Tag[];
  cachedMALInfo?: {
    lastUpdateMs: number;
    data: MALAnimeInfo;
  };

  /**
   * @deprecated
   */
  get lastCompleteWatchEntry():
    | DocumentContexted<CompleteWatchEntry>
    | undefined;
};

type MALAnimeInfo = {
  mal_id: number;
  title: string;
  url: string;
  image_url: string;
  type: string;
  episodes: number;
};

export class ShowFactory {
  public static createShow(
    declarationLine: number,
    initializer: Show | { title: string; tags?: Tag[] },
  ) {
    const { title, lastMentionedLine, watchEntries, tags } =
      initializer as Show;

    return <Show>{
      title,
      lastMentionedLine: lastMentionedLine ?? declarationLine,
      watchEntries: watchEntries ?? [],
      firstMentionedLine: declarationLine,
      tags: tags ?? [],

      get lastCompleteWatchEntry() {
        const a = Array.from(this.watchEntries)
          .reverse()
          .find((w) => w.data.partial === false);
        return a as DocumentContexted<CompleteWatchEntry> | undefined; //TODO: type guard
      },
    };
  }
}

/**
 * @deprecated
 */
export abstract class MALShow<T> {
  static async getMALInfo(showInfo: Show): Promise<Anime> {
    const cacheTimeExpirationMs = 24 * 60 * 60 * 1000; //1 day in milliseconds

    if (
      !showInfo.cachedMALInfo ||
      Date.now() - showInfo.cachedMALInfo.lastUpdateMs > cacheTimeExpirationMs
    ) {
      showInfo.cachedMALInfo = {
        lastUpdateMs: Date.now(),
        data: await Anime.searchMALInfo(showInfo),
      };
    }

    return showInfo.cachedMALInfo.data;
  }

  abstract searchMALInfo(): Promise<T>;
}

/**
 * @deprecated
 */
export class Anime {
  static async searchMALInfo(showInfo: Show): Promise<MALAnimeInfo> {
    const result = await MAL.searchAnime(showInfo.title);
    if (result.length > 0) {
      return <MALAnimeInfo>{
        mal_id: result[0].mal_id,
        title: result[0].title,
        url: result[0].url,
        type: result[0].type,
        episodes: result[0].episodes,
      };
    }

    throw new Error("Anime Not found");
  }
}
