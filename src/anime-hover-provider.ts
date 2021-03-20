import { CancellationToken, ExtensionContext, Hover, MarkdownString, Position, TextDocument, window } from "vscode";

import AnimeDataStorage from "./cache/anime/anime-data-storage";
import findContext from "./list-parser/anime-context-finder";
import { searchAnime } from "./services/mal";
import { AnimeSearchResultItem } from "./types";

async function searchMAL(animeTitle: string) {
    let foundAnimes = await searchAnime(animeTitle);
    return foundAnimes.length > 0 ? foundAnimes[0] : undefined;
}

function getAnimeID(animeTitle: string) {

}

export function createHoverProvider(extensionContext: ExtensionContext) {
    return {
        async provideHover(document: TextDocument, position: Position, token: CancellationToken) {
            let animeStorage = extensionContext.workspaceState.get<AnimeDataStorage>("marucs-anime:storage");
            if (!animeStorage) { return; }

            if (!window.activeTextEditor) { return; }

            let animeContext = findContext(window.activeTextEditor, position.line);

            let anime = animeStorage.getAnime(animeContext.currAnimeName);
            if (!anime) {
                throw new Error("Impossible state");
            }

            if (!anime.hasFullInfo()) {
                await anime.searchMAL();
            }

            let animeInfo = anime.getFullInfo() ?? { ...anime.getBasicInfo(), url: "Error" };

            let mdString = new MarkdownString(
                `### ${animeContext.currAnimeName}: ` +
                `\n- Last episode: ${animeInfo.lastWatchedEpisode}` +
                `\n- URL: ${animeInfo.url}`
            );

            return new Hover(mdString);
        }
    };
}