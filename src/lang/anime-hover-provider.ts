import { CancellationToken, ExtensionContext, Hover, HoverProvider, languages, MarkdownString, Position, TextDocument, window } from "vscode";
import { LANGUAGE_ID } from "../constants";

import { MarucsAnime } from "../extension";
import LineContext from "../list-parser/line-context";
import LineContextFinder from "../list-parser/line-context-finder";
import { MAL } from "../services/mal";

async function searchMAL(animeTitle: string) {
    let foundAnimes = await MAL.searchAnime(animeTitle);

    if (foundAnimes.length === 0) {
        return undefined;
    }

    if (foundAnimes[0].titles.filter(title => title.title.toLowerCase() === animeTitle.toLowerCase()).length === 0) {
        return undefined;
    }

    return foundAnimes[0];
}

export default class ShowHoverProvider implements HoverProvider {
    public static register(context: ExtensionContext) {
        const provider = new ShowHoverProvider(context);
        return languages.registerHoverProvider(this.viewType, provider);
    }

    private static readonly viewType = LANGUAGE_ID;

    constructor(private readonly context: ExtensionContext) { }

    private generateLineContextMD(document: TextDocument, line: number) {
        const searchResult = LineContextFinder.findContext(document, line);
        
        if (!searchResult.ok) {
            const md = new MarkdownString();
            md.appendMarkdown(`### ERROR: `);
            md.appendText(`${searchResult.error.message}`);
            return md;
        }

        const lineContext = searchResult.result;
        const { currentDateLine, currentShowLine, currentTagsLines } = lineContext;

        if (!currentDateLine || !currentShowLine) {
            const md = new MarkdownString();
            md.appendMarkdown(`### ERROR: `);
            md.appendText(`${"currentDateLine or currentShowLine are undefined"}`);
            return md;
        }
        
        const tagNames = currentTagsLines.map(lineInfo => lineInfo.params.tag.name);
        const tagNamesString = tagNames.join(', ');

        const show = MarucsAnime.INSTANCE.showStorage.getShow(currentShowLine.params.showTitle);
        let showLastTitle = 'NOT FOUND';
        let showLastDate = 'NOT FOUND';
        let showLastTagNamesString = 'NOT FOUND';
        if (show) {
            const firstMentionedContext = LineContextFinder.findContext(document, show.info.firstMentionedLine+1);
            if (firstMentionedContext.ok) {
                showLastTitle = firstMentionedContext.result.currentShowLine?.params.showTitle || 'EMPTY';
                showLastDate = firstMentionedContext.result.currentDateLine?.params.date || "EMPTY";
                showLastTagNamesString = firstMentionedContext.result.currentTagsLines.map(lineInfo => lineInfo.params.tag).join(', ');
            }
        }

        return new MarkdownString(
            `\n\nCurrent Line Context:` +
            `\n\n  - Current Date: ${currentDateLine.params.date}` +
            `\n\n  - Current Show: ${currentShowLine.params.showTitle}` +
            `\n\n  - Current Tags: [${tagNamesString}]` +
            `\n\nFirst Mention Show Context:` +
            `\n\n  - First Mention Date: ${showLastDate}` +
            `\n\n  - First Mention Show: ${showLastTitle}` +
            `\n\n  - First Mention Tags: [${showLastTagNamesString}]`
        );
    }

    public async provideHover(document: TextDocument, position: Position, token: CancellationToken) {
        const extension = MarucsAnime.INSTANCE;
        
        if (!window.activeTextEditor) { return; }

        const lineContext = LineContextFinder.findContext(document, position.line);
        if (!lineContext.ok) {
            return;
        }

        const malData = await searchMAL(lineContext.result.currentShowLine.params.showTitle);
        const lineContextMD = new MarkdownString(
            `<img align="left" width="200" src="https://www.rd.com/wp-content/uploads/2018/02/25_Hilarious-Photos-that-Will-Get-You-Through-the-Week_280228817_Doty911.jpg" />

            # Headline 
            
            Some text`
        );

        const newMD = this.generateLineContextMD(document, position.line);
        
        return new Hover([lineContextMD, newMD]);
    }
};
