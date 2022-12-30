import { CancellationToken, CodeLens, CodeLensProvider, Command, CompletionItem, CompletionItemKind, CompletionItemProvider, CompletionTriggerKind, DebugConsoleMode, DocumentFilter, ExtensionContext, languages, Position, ProviderResult, Range, TextDocument, TextEdit, window } from "vscode";
import * as vscode from "vscode";
import { LANGUAGE_ID } from "../constants";
import { MarucsAnime } from "../extension";
import LineContextFinder from "../list-parser/line-context-finder";
import { equip, isErr } from "rustic";

export default class ShowLensProvider implements CodeLensProvider {
    public static register(context: ExtensionContext) {
        const provider = new ShowLensProvider(context);
        return languages.registerCodeLensProvider(this.viewType, provider);
    }

    private static readonly viewType = LANGUAGE_ID;

    constructor(private readonly context: ExtensionContext) { }

    public provideCodeLenses(document: TextDocument, token: CancellationToken): CodeLens[] | Thenable<CodeLens[]> {
        console.log('provideCodeLenses');

        if (document !== vscode.window.activeTextEditor?.document) {
            console.warn('provideCodeLenses had weird document');
            return [];
        }

        const selection = vscode.window.activeTextEditor?.selection;
        if (!selection?.isSingleLine) {
            return [];
        }
        
        const currLine = selection.start.line;
        const lineContext = LineContextFinder.findContext(document, currLine);

        let lineMessages: string[] = [];
        let targetLine = equip(lineContext).mapOr(currLine, (ctx) => ctx.currentShowLine.line.lineNumber);

        if (isErr(lineContext)) {
            lineMessages.push(`${lineContext.data}`);
        } else {
            const currShowTitle = lineContext.data.currentShowLine.params.showTitle;
            const show = MarucsAnime.INSTANCE.showStorage.searchShow(currShowTitle);
            if (!show) {
                lineMessages.push(`Show '${currShowTitle}' not found in database`);
            } else {
                const originalShowContext = LineContextFinder.findContext(document, show.info.firstMentionedLine);
                if (isErr(originalShowContext)) {
                    lineMessages.push(`Original '${currShowTitle}' context is invalid... Error: ${originalShowContext.data}`);
                } else {
                    lineMessages.push(`Show original Tags: [${originalShowContext.data.currentTagsLines.map(lineInfo => lineInfo.params.tag.name).join(', ')}]`);
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
}