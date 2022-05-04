import { CancellationToken, CompletionContext, CompletionItem, CompletionItemKind, CompletionItemProvider, CompletionTriggerKind, DebugConsoleMode, DocumentFilter, ExtensionContext, languages, Position, ProviderResult, TextDocument, TextEdit, window } from "vscode";
import ShowStorage from "../cache/anime/showStorage";
import { MAExtension } from "../extension";
import { LineType } from "../list-parser/line-type";

enum CompletionType {
    ShowTitle = 1,
    Friend,
    Tag,
    Episode,
    NoCompletion,
}

type SurroundingTokenInfo = {
    insideTokensRange: boolean,
    validState: boolean,
};

export default class ShowCompletionItemProvider implements CompletionItemProvider<CompletionItem> {
    public static register(context: ExtensionContext) {
        const provider = new ShowCompletionItemProvider(context);
        return languages.registerCompletionItemProvider(this.viewType, provider);
    }

    private static viewType = "anime-list";

    constructor(private readonly context: ExtensionContext) { }

    private determineCompletionType(text: string, cursorIndex: number): CompletionType {
        let surroundingInfo: SurroundingTokenInfo;
        const ifValidElseNoCompletion =
            (completionType: CompletionType) =>
                surroundingInfo.validState ? completionType : CompletionType.NoCompletion;

        surroundingInfo = this.getSurroundingTokenInfo(text, cursorIndex, '{', '}');
        if (surroundingInfo.insideTokensRange) {
            return ifValidElseNoCompletion(CompletionType.Friend);
        }


        surroundingInfo = this.getSurroundingTokenInfo(text, cursorIndex, '[', ']');
        if (surroundingInfo.insideTokensRange) {
            return ifValidElseNoCompletion(CompletionType.Tag);
        }

        return CompletionType.ShowTitle;
    }

    private getSurroundingTokenInfo(text: string, cursorIndex: number, startToken: string, endToken: string): SurroundingTokenInfo {
        const countOccurrencesOf = (char: string) => text.match(`\\${char}`)?.length ?? 0;

        const startTokenFirstIdx = text.indexOf(startToken);
        const endTokenFirstIdx = text.indexOf(endToken);

        const startTokenCount = countOccurrencesOf(startToken);
        const endTokenCount = countOccurrencesOf(endToken);

        const validState = endTokenCount === 0 && startTokenCount === 1;
        const insideTokensRange = startTokenCount > 0 && (cursorIndex > startTokenFirstIdx && (cursorIndex < endTokenFirstIdx || endTokenCount === 0));

        return {
            validState,
            insideTokensRange,
        };
    }

    private getCompletionOptionsFromStorage(storage: ShowStorage, completionType: CompletionType): string[] {
        switch (completionType) {
            case CompletionType.Friend: return storage.listFriends();
            case CompletionType.ShowTitle: return storage.listShows();
            default:
                console.error('Not Implemented completion: ', completionType.toString());
                return [];
        }
    }

    private filterCompletionOptions(alreadyTypedText: string, completionOptions: string[], ignoreCase = true, ignoreWhiteSpaces = true): string[] {
        const filterFn = (option: string) => {
            if (ignoreCase) {
                option = option.toLowerCase();
                alreadyTypedText = alreadyTypedText.toLowerCase();
            }
            if (ignoreWhiteSpaces) {
                option = option.trim();
                alreadyTypedText = alreadyTypedText.trim();
            }

            return option.startsWith(alreadyTypedText);
        };

        return completionOptions.filter(filterFn);
    }

    private convertOptions(options: string[], completionType: CompletionType): CompletionItem[] {
        const getCompletionKind = () => {
            const kinds = {
                [CompletionType.Friend]: CompletionItemKind.User,
                [CompletionType.ShowTitle]: CompletionItemKind.Class,
                [CompletionType.Tag]: CompletionItemKind.Property,
                [CompletionType.Episode]: CompletionItemKind.Constant,
                [CompletionType.NoCompletion]: CompletionItemKind.Text,
            };
            return kinds[completionType] ?? CompletionItemKind.Text;
        };

        const getInsertTextFn = () => {
            const funcs = {
                [CompletionType.Friend]: (label: string) => label + ',',
                [CompletionType.ShowTitle]: (label: string) => label + ':',
                [CompletionType.Tag]: (label: string) => label + ']',
                [CompletionType.Episode]: (label: string) => label + ' ',
                [CompletionType.NoCompletion]: (_: string) => '',
            };
            return funcs[completionType];
        };

        const conversionFn = (option: string): CompletionItem => ({
            label: option,
            kind: getCompletionKind(),
            insertText: getInsertTextFn()(option),
        });

        return options.map(conversionFn);
    }

    private getAlreadyTypedText(lineText: string, charPosition: number, completionType: CompletionType) {
        let match;
        const re = /[{,]/g;
        let attStart = -1;
        while ((match = re.exec(lineText)) !== null) {
            attStart = match.index;
        }

        if (attStart < 0 || attStart >= lineText.length) {
            return '';
        }
        return lineText.substring(attStart + 1, charPosition);
    }

    public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, completionContext: CompletionContext): ProviderResult<CompletionItem[]> {
        const extension = MAExtension.INSTANCE;

        const text = document.lineAt(position.line).text;
        const horizPosition = position.character;

        const completionType = this.determineCompletionType(text, horizPosition);
        const completionOptions = this.getCompletionOptionsFromStorage(extension.showStorage, completionType);
        const alreadyTypedText = this.getAlreadyTypedText(text, horizPosition, completionType);
        const filteredOptions = this.filterCompletionOptions(alreadyTypedText, completionOptions);
        const completions = this.convertOptions(filteredOptions, completionType);
        console.log();
        console.log({
            completionType,
            completionOptions,
            filteredOptions
        });
        console.log({
            text,
            alreadyTypedText,
        });
        console.log();

        if (completions.length === 0) {
            return [{} as CompletionItem];
        }
        
        return completions;
    }
}