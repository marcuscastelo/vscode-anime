import { CancellationToken, CodeLens, CodeLensProvider, Command, CompletionItem, CompletionItemKind, CompletionItemProvider, CompletionTriggerKind, DebugConsoleMode, DocumentFilter, ExtensionContext, languages, Position, ProviderResult, Range, TextDocument, TextEdit, window } from "vscode";
import * as vscode from "vscode";
import { LANGUAGE_ID } from "../constants";
import { MarucsAnime } from "../extension";
import LineContextFinder from "../list-parser/line-context-finder";
import { MAL } from "../services/mal";
import { checkTags } from "../analysis/check-tags";

export default class ShowLensProvider implements CodeLensProvider {
    public static register(context: ExtensionContext) {
        const provider = new ShowLensProvider(context);
        return languages.registerCodeLensProvider(this.viewType, provider);
    }

    private static readonly viewType = LANGUAGE_ID;

    constructor(private readonly context: ExtensionContext) { }

    private generateTagLens(document: TextDocument, line: number) {
        const lineContext = LineContextFinder.findContext(document, line);

        let lineMessages: string[] = [];
        let targetLine = lineContext.ok ? lineContext.result.currentShowLine.line.lineNumber : line;

        if (!lineContext.ok) {
            lineMessages.push(`${lineContext.error}`);
        } else {
            const currShowTitle = lineContext.result.currentShowLine.params.showTitle;
            const show = MarucsAnime.INSTANCE.showStorage.getShow(currShowTitle);
            if (!show) {
                lineMessages.push(`Show '${currShowTitle}' not found in database`);
            } else {
                const originalShowContext = LineContextFinder.findContext(document, show.info.firstMentionedLine);
                if (!originalShowContext.ok) {
                    lineMessages.push(`Original '${currShowTitle}' context is invalid...`);
                } else {
                    const currTags = lineContext.result.currentTagsLines.map(lineInfo => lineInfo.params.tag);
                    const { extraTags, missingTags } = checkTags(document, currTags, show);
                    if (extraTags.length > 0) {
                        lineMessages.push(`Extra tags: ${extraTags.map(tag => tag.name).join(', ')}`);
                    }
                    if (missingTags.length > 0) {
                        lineMessages.push(`Missing tags: ${missingTags.map(tag => tag.name).join(', ')}`);
                    }
                }
            }
        }
        
        return lineMessages.map(title =>
            new CodeLens(
                new Range(targetLine, 0, targetLine+1, 10),
                {
                    title,
                    command: ''
                }
            )
        );
    }

    private async generateEpisodesLens(document: TextDocument, line: number) {
        const lineContext = LineContextFinder.findContext(document, line);
        const range = new Range(line, 0, line+1, 10);

        if (!lineContext.ok) {
            console.warn('generateEpisodesLens had invalid context');
            return [];
        }

        const currShowTitle = lineContext.result.currentShowLine.params.showTitle;
        const show = MarucsAnime.INSTANCE.showStorage.getShow(currShowTitle);
        if (!show) {
            console.warn(`generateEpisodesLens had invalid show '${currShowTitle}'`);
            return [new CodeLens(
                range,
                {
                    title: `${currShowTitle} not found in MAL`,
                    command: ''
                }
            )];
        }

        const lastWatchedEpisode = show.info.lastWatchEntry.episode;

        const malData = await MAL.searchAnime(currShowTitle);
        if (!malData || malData.length === 0 || !malData[0].episodes) {
            console.warn(`generateEpisodesLens had invalid MAL data for '${currShowTitle}'`);
            return [];
        }

        const episodes = malData[0].episodes;
        
        return [
            new CodeLens(
                range,
                {
                    title: `Watched ${lastWatchedEpisode}/${episodes}`,
                    command: ''
                }
            )
        ];
    }

    private async generateCodeLens(document: TextDocument, line: number) {
        const context = LineContextFinder.findContext(document, line);
        if (!context.ok) {
            return [];
        }

        const currShowLine = context.result.currentShowLine;
        
        const tagLens = this.generateTagLens(document, line);
        const episodeLens = await this.generateEpisodesLens(document, currShowLine.line.lineNumber);

        return [
            ...tagLens,
            ...episodeLens
        ];
    }

    public async provideCodeLenses(document: TextDocument, token: CancellationToken): Promise<CodeLens[]> {
        console.log('provideCodeLenses');

        if (document !== vscode.window.activeTextEditor?.document) {
            console.warn('provideCodeLenses had weird document');
            return [];
        }

        const lenses: CodeLens[] = [];

        for (let i = document.lineCount-1; i > 0; i--) {
            const line = document.lineAt(i);
            if (!line.text.endsWith(':')) {
                continue; // Only check lines with a colon (show title lines)
            }
            
            console.log(`Processing lenses for line '${line.text}'...`);
            lenses.push(...await this.generateCodeLens(document, i));

            if (lenses.length > 10) {
                break; // Only check the last 10 lines (for now) //TODO: use resolveCodeLens
            }
        }

        return lenses;
    }
}