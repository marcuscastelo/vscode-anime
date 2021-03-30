import { CancellationToken, ExtensionContext, Hover, HoverProvider, languages, MarkdownString, Position, TextDocument, window } from "vscode";

import ShowStorage from "../cache/anime/showStorage";
import { Anime } from "../cache/anime/shows";
import { MAExtension } from "../extension";
import LineContextFinder from "../list-parser/line-context-finder";
import { MAL } from "../services/mal";
import { AnimeSearchResultItem, Tags } from "../types";

async function searchMAL(animeTitle: string) {
    let foundAnimes = await MAL.searchAnime(animeTitle);
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
        const extension = MAExtension.INSTANCE;
        
        if (!window.activeTextEditor) { return; }

        let lineContext = LineContextFinder.findContext(window.activeTextEditor.document, position.line);

        if (!lineContext.valid) {
            return;
        }

        let showTitle = lineContext.context.currentShowTitle;

        let show = extension.showStorage.getShow(showTitle);

        let mdString: MarkdownString;
        if (show instanceof Anime) {
            let showInfo = show.info;
            let malInfo = await show.getMALInfo();
    
            mdString = new MarkdownString(
                `### ${showTitle}: ` +
                `\n ![anime image](${malInfo.image_url})` +
                `\n- Last episode: ${showInfo.lastWatchEntry.episode}/${malInfo.episodes}` +
                `\n- URL: ${malInfo.url}`
            );
        }
        else {
            mdString = new MarkdownString(
                `### ${showTitle}:` +
                `\n NOT-ANIME`
            );
        }

        return new Hover(mdString);
    }
};
