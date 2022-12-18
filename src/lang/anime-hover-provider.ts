import { CancellationToken, ExtensionContext, Hover, HoverProvider, languages, MarkdownString, Position, TextDocument, window } from "vscode";

import { MarucsAnime } from "../extension";
import LineContext from "../list-parser/line-context";
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

    private generateLineContextHover(document: TextDocument, line: number) {
        const searchResult = LineContextFinder.findContext(document, line);
        
        if (!searchResult.valid) {
            const md = new MarkdownString();
            md.appendMarkdown(`### ERROR: `);
            md.appendText(`${searchResult.error.message}`);
            return new Hover(md);
        }

        const lineContext = searchResult.context;
        const { currDate, currShowTitle, currTags } = lineContext;
        
        const tagNames = currTags.map(tag => tag.name);
        const tagNamesString = tagNames.join(', ');

        const show = MarucsAnime.INSTANCE.showStorage.getShow(currShowTitle);
        let showLastTitle = 'NOT FOUND';
        let showLastDate = 'NOT FOUND';
        let showLastTagNamesString = 'NOT FOUND';
        if (show) {
            const firstMentionedContext = LineContextFinder.findContext(document, show.info.firstMentionedLine+1);
            if (firstMentionedContext.valid) {
                showLastTitle = firstMentionedContext.context.currShowTitle;
                showLastDate = firstMentionedContext.context.currDate;
                showLastTagNamesString = firstMentionedContext.context.currTags.map(tag => tag.name).join(', ');
            }
        }

        console.dir(lineContext);
        return new Hover(new MarkdownString(
            `\n\nCurrent Line Context:` +
            `\n\n  - Current Date: ${currDate}` +
            `\n\n  - Current Show: ${currShowTitle}` +
            `\n\n  - Current Tags: [${tagNamesString}]` +
            `\n\nFirst Mention Show Context:` +
            `\n\n  - First Mention Date: ${showLastDate}` +
            `\n\n  - First Mention Show: ${showLastTitle}` +
            `\n\n  - First Mention Tags: [${showLastTagNamesString}]`
        ));
    }


    public async provideHover(document: TextDocument, position: Position, token: CancellationToken) {
        const extension = MarucsAnime.INSTANCE;
        
        if (!window.activeTextEditor) { return; }

        const lineContextHoverText = this.generateLineContextHover(document, position.line);
        return lineContextHoverText;


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
