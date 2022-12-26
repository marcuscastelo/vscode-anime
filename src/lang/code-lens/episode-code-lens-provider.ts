import { CancellationToken, CodeLens, CodeLensProvider, Command, CompletionItem, CompletionItemKind, CompletionItemProvider, CompletionTriggerKind, DebugConsoleMode, DocumentFilter, ExtensionContext, languages, Position, ProviderResult, Range, TextDocument, TextEdit, window } from "vscode";
import * as vscode from "vscode";
import { LANGUAGE_ID } from "../../constants";
import { MarucsAnime } from "../../extension";
import LineContextFinder from "../../list-parser/line-context-finder";
import { MAL } from "../../services/mal";
import { checkTags } from "../../analysis/check-tags";

export default class EpisodeLensProvider implements CodeLensProvider {
    public static register(context: ExtensionContext) {
        const provider = new EpisodeLensProvider(context);
        return languages.registerCodeLensProvider(this.viewType, provider);
    }

    private static readonly viewType = LANGUAGE_ID;

    constructor(private readonly context: ExtensionContext) { }

    private async generateEpisodesLens(document: TextDocument, line: number, lazy = false): Promise<CodeLens> {
        const lineContext = LineContextFinder.findContext(document, line);
        const range = new Range(line, 0, line + 1, 10);

        if (lazy) {
            return new CodeLens(range);
        }

        if (!lineContext.ok) {
            console.warn('generateEpisodesLens had invalid context');
            return new CodeLens(
                range,
                {
                    title: `${lineContext.error}`,
                    command: ''
                }
            );
        }

        const currShowTitle = lineContext.result.currentShowLine.params.showTitle;
        const show = MarucsAnime.INSTANCE.showStorage.getShow(currShowTitle);
        if (!show) {
            console.warn(`generateEpisodesLens had invalid show '${currShowTitle}'`);
            return new CodeLens(
                range,
                {
                    title: `${currShowTitle} not found in MAL`,
                    command: ''
                }
            );
        }

        const lastWatchedEpisode = show.info.lastWatchEntry.episode;

        const bestAnimeMatch = await MAL.searchBestAnime(currShowTitle);
        if (!bestAnimeMatch) {
            console.warn(`generateEpisodesLens had invalid MAL data for '${currShowTitle}'`);
            return new CodeLens(
                range,
                {
                    title: `${currShowTitle} not found in MAL`,
                    command: ''
                }
            );
        }

        const episodes = bestAnimeMatch.episodes;

        return new CodeLens(
            range,
            {
                title: `Watched ${lastWatchedEpisode}/${episodes}`,
                command: ''
            }
        );
    }

    async provideCodeLenses(document: TextDocument, token: CancellationToken): Promise<CodeLens[]> {
        console.log('provideCodeLenses');

        if (document !== vscode.window.activeTextEditor?.document) {
            console.warn('provideCodeLenses had weird document');
            return [];
        }

        const lenses: CodeLens[] = [];

        for (let i = document.lineCount - 1; i > 0; i--) {
            const line = document.lineAt(i);
            if (!line.text.endsWith(':')) {
                continue; // Only check lines with a colon (show title lines)
            }

            console.log(`Processing episode lenses for line '${line.text}'...`);
            lenses.push(await this.generateEpisodesLens(document, i, true));

            if (lenses.length > 1750) {
                break; // Only check the last 10 lines (for now) //TODO: use resolveCodeLens
            }
        }

        console.log(`Found ${lenses.length} episode lenses`);
        return lenses;
    }

    public async resolveCodeLens?(codeLens: CodeLens, token: CancellationToken): Promise<CodeLens> {
        console.log('resolveCodeLens');
        const line = codeLens.range.start.line;
        const document = vscode.window.activeTextEditor?.document;
        if (!document) {
            console.warn('resolveCodeLens had weird document');
            return codeLens;
        }

        const newCodeLens = await this.generateEpisodesLens(document, line, false);
        return newCodeLens;
    }
}