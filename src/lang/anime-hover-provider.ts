import { CancellationToken, ExtensionContext, Hover, HoverProvider, languages, MarkdownString, Position, TextDocument, window } from "vscode";

import { MAExtension } from "../extension";
import LineContextFinder from "../list-parser/line-context-finder";
import { MAL } from "../services/mal";

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

        const lineContext = LineContextFinder.findContext(document, position.line);

        if (!lineContext.valid) {
            const md = new MarkdownString();
            md.appendMarkdown(`### ERROR: `);
            md.appendText(`${lineContext.error.message}`);
            return new Hover(md);
        }
        return new Hover(new MarkdownString(
            `Valid: ${lineContext.valid ? 'Valid' : 'Invalid'} line` +
            `\n\nCurrent Date: ${lineContext.context.currDate}` +
            `\n\nCurrent Show: ${lineContext.context.currShowTitle}` +
            // `\n\nLast WatchEntry:`+
            // `\n\n\t${JSON.stringify(lineContext.context.lastWatchEntry, null, '\t\t')}`
            ""
        ));

        // let { type: lineType } = LineIdentifier.identifyLine(window.activeTextEditor.document.lineAt(position.line));
        // if (lineType !== LineType.ShowTitle) {
        //     return;
        // }


        // let showTitle = lineContext.context.currentShowTitle;

        // let show = extension.showStorage.getShow(showTitle);

        // let mdString: MarkdownString;
        // if (show instanceof Anime) {
        //     let showInfo = show.info;
        //     let malInfo = await show.getMALInfo();
    
        //     mdString = new MarkdownString(
        //         `### ${showTitle}: ` +
        //         `\n ![anime image](${malInfo.image_url})` +
        //         `\n- Last episode: ${showInfo.lastWatchEntry.episode}/${malInfo.episodes}` +
        //         `\n- URL: ${malInfo.url}`
        //     );
        // }
        // else {
        //     mdString = new MarkdownString(
        //         `### ${showTitle}:` +
        //         `\n NOT-ANIME`
        //     );
        // }

        // return new Hover(mdString);
    }
};
