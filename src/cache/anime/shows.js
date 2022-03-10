"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Anime = exports.Manga = exports.MALShow = exports.Show = void 0;
const mal_1 = require("../../services/mal");
class Show {
    constructor(declarationLine, initializer) {
        const { title, lastMentionedLine, lastWatchEntry: lastWatchedEpisode, tags } = initializer;
        this.info = {
            title,
            lastMentionedLine: lastMentionedLine ?? -1,
            lastWatchEntry: lastWatchedEpisode ?? 0,
            firstMentionedLine: declarationLine,
            tags: tags ?? []
        };
    }
    updateLastMentionedLine(lineNumber) {
        this.info.lastMentionedLine = lineNumber;
    }
    updateLastWatchEntry(lastEntry) {
        this.info.lastWatchEntry = lastEntry;
        this.info.lastMentionedLine = lastEntry.lineNumber;
    }
}
exports.Show = Show;
class MALShow extends Show {
    async getMALInfo() {
        const cacheTimeExpirationMs = 24 * 60 * 60 * 1000; //1 day in milliseconds
        if (!this.cachedMALInfo || (Date.now() - this.cachedMALInfo.lastUpdateMs) > cacheTimeExpirationMs)
            this.cachedMALInfo = {
                lastUpdateMs: Date.now(),
                data: await this.searchMALInfo()
            };
        return this.cachedMALInfo.data;
    }
}
exports.MALShow = MALShow;
class Manga extends MALShow {
    searchMALInfo() {
        throw new Error("Method not implemented.");
    }
}
exports.Manga = Manga;
class Anime extends MALShow {
    async searchMALInfo() {
        const result = await mal_1.MAL.searchAnime(this.info.title);
        if (result.length > 0)
            return result[0];
        throw new Error('Anime Not found');
    }
}
exports.Anime = Anime;
//# sourceMappingURL=shows.js.map