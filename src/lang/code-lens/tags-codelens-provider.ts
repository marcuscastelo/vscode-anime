import { CancellationToken, CodeLens, CodeLensProvider, Command, CompletionItem, CompletionItemKind, CompletionItemProvider, CompletionTriggerKind, DebugConsoleMode, DocumentFilter, ExtensionContext, languages, Position, ProviderResult, Range, TextDocument, TextEdit, window } from "vscode";
import * as vscode from "vscode";
import { LANGUAGE_ID } from "../../constants";
import { MarucsAnime } from "../../extension";
import LineContextFinder from "../../list-parser/line-context-finder";
import { MAL } from "../../services/mal";
import { checkTags } from "../../analysis/check-tags";

export default class TagsLensProvider implements CodeLensProvider {
    public static register(context: ExtensionContext) {
        const provider = new TagsLensProvider(context);
        return languages.registerCodeLensProvider(this.viewType, provider);
    }

    private static readonly viewType = LANGUAGE_ID;

    constructor(private readonly context: ExtensionContext) { }

    private generateTagLens(document: TextDocument, line: number, lazy = false) {
        const lineContext = LineContextFinder.findContext(document, line);

        let lineMessages: string[] = [];
        let targetLine = lineContext.ok ? lineContext.result.currentShowLine.line.lineNumber : line;
        const range = new Range(targetLine, 0, targetLine+1, 10);

        if (lazy) {
            return new CodeLens(range);
        }

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
        
        const title = lineMessages.length > 0 ? `${lineMessages.join(', ')}` : undefined;
        if (!title) {
            return undefined;
        }

        return new CodeLens(
            range,
            {
                title,
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

        for (let i = document.lineCount-1; i > 0; i--) {
            const line = document.lineAt(i);
            if (!line.text.endsWith(':')) {
                continue; // Only check lines with a colon (show title lines)
            }
            
            console.log(`Processing tag lenses for line '${line.text}'...`);
            const lens = await this.generateTagLens(document, i, true);
            if (lens) {
                lenses.push(lens);
            }

            if (lenses.length > 1750) {
                break; // Only check the last 10 lines (for now) //TODO: use resolveCodeLens
            }
        }

        console.log(`Found ${lenses.length} tag lenses`);
        return lenses;
    }

    public async resolveCodeLens?(codeLens: CodeLens, token: CancellationToken) {
        console.log('resolveCodeLens');
        const line = codeLens.range.start.line;
        const document = vscode.window.activeTextEditor?.document;
        if (!document) {
            console.warn('resolveCodeLens had weird document');
            return codeLens;
        }

        const newLens = this.generateTagLens(document, line);
        return newLens ?? {
            ...codeLens,
            command: {
                title: '',
                command: ''
            }
        };
    }
}