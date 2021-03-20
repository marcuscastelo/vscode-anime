import { searchAnime } from "../../services/mal";

type ShowCacheInfo = {
    title: string,
    lastWatchedEpisode: number,
    lastMentionedLine: number,
};

type MALShowCacheInfo = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    mal_id: number,
    title: string,
    url: string,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    image_url: string,
    type: string,
    episodes: number,
};

enum AnimeCacheStage { basic, full };

type BasicAnimeCacheInfo = ShowCacheInfo & {
    stage: AnimeCacheStage
};

type FullAnimeCacheInfo = BasicAnimeCacheInfo & MALShowCacheInfo;

export default class Anime {
    info: FullAnimeCacheInfo;
    constructor(title: string) {
        this.info = {
            title,
            lastMentionedLine: -1,
            lastWatchedEpisode: 0,
            stage: AnimeCacheStage.basic
        } as FullAnimeCacheInfo;
    }

    getBasicInfo(): BasicAnimeCacheInfo {
        return { ...this.info };
    }

    getFullInfo(): FullAnimeCacheInfo | undefined {
        if (!this.hasFullInfo()) { return; }

        return { ...this.info };
    }

    hasFullInfo() { return this.info.stage === AnimeCacheStage.full; }

    async searchMAL() {
        let foundAnimes = await searchAnime(this.info.title);
        for (let anime of foundAnimes) {
            if (anime.title === this.info.title) {
                console.log("Found!\n", anime);
                this.info = {
                    ...this.info,
                    ...anime
                };
                
                this.info.stage = AnimeCacheStage.full;
            }
        }
    }

    updateLastMentionedLine(line: number) {
        this.info.lastMentionedLine = line;
    }

    updateLastWatchedEpisode(episode: number, line: number) {
        //TODO: check continuity, i.e: (3, 4, 5) and not (3, 5 ,4)
        this.info.lastMentionedLine = line;
        this.info.lastWatchedEpisode = episode;
    }
    
}