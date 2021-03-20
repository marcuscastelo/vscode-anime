import { CancellationToken, ExtensionContext, Hover, HoverProvider, languages, MarkdownString, Position, TextDocument, window } from "vscode";

import AnimeDataStorage from "./cache/anime/anime-data-storage";
import findContext from "./list-parser/anime-context-finder";
import { searchAnime } from "./services/mal";
import { AnimeSearchResultItem, Tags } from "./types";

async function searchMAL(animeTitle: string) {
    let foundAnimes = await searchAnime(animeTitle);
    return foundAnimes.length > 0 ? foundAnimes[0] : undefined;
}

function getAnimeID(animeTitle: string) {

}

export default class ShowHoverProvider implements HoverProvider {
    public static register(context: ExtensionContext) {
        const provider = new ShowHoverProvider(context);
        return languages.registerHoverProvider(this.viewType, provider);
    }

    private static readonly viewType = 'anime-list';

    constructor(private readonly context: ExtensionContext) { }

    public async provideHover(document: TextDocument, position: Position, token: CancellationToken) {
        let animeStorage = this.context.workspaceState.get<AnimeDataStorage>("marucs-anime:storage");
        if (!animeStorage) { return; }

        if (!window.activeTextEditor) { return; }

        let animeContext = findContext(window.activeTextEditor, position.line);

        let anime = animeStorage.getAnime(animeContext.currAnimeName);
        if (!anime) {
            throw new Error("Impossible state");
        }

        let animeInfo = anime.getBasicInfo();

        let mdString: MarkdownString;

        if (animeInfo.tags.indexOf(Tags["NOT-ANIME"]) !== -1) {
            mdString = new MarkdownString(
                `### ${animeContext.currAnimeName}:` +
                `\n NOT-ANIME`
            );
        } else {

            if (!anime.hasFullInfo()) {
                await anime.searchMAL();
            }

            let animeInfo = anime.getFullInfo() ??
            {
                ...anime.getBasicInfo(),
                url: "Error",
                episodes: NaN,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                image_url: ''
            };

            mdString = new MarkdownString(
                `### ${animeContext.currAnimeName}: ` +
                `\n ![anime image](${animeInfo.image_url})` +
                `\n- Last episode: ${animeInfo.lastWatchedEpisode}/${animeInfo.episodes}` +
                `\n- URL: ${animeInfo.url}`
            );
        }
        return new Hover(mdString);
    }
};
