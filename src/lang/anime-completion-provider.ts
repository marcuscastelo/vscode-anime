import { CancellationToken, CompletionContext, CompletionItem, CompletionItemKind, CompletionItemProvider, CompletionTriggerKind, DebugConsoleMode, DocumentFilter, ExtensionContext, languages, Position, ProviderResult, Range, TextDocument, TextEdit, window } from "vscode";
import * as vscode from "vscode";
import ShowStorage from "../cache/anime/show-storage";
import { LANGUAGE_ID } from "../constants";
import { MarucsAnime } from "../extension";
import { Tags } from "../types";

enum CompletionType {
    ShowTitle = 1,
    Friend,
    Tag,
    Episode,
    NoCompletion,
}

type SurroundingTokenInfo = {
    insideTokens: boolean,
    validState: boolean,
};

export default class ShowCompletionItemProvider implements CompletionItemProvider<CompletionItem> {
    public static register(context: ExtensionContext) {
        const provider = new ShowCompletionItemProvider(context);
        return languages.registerCompletionItemProvider(this.viewType, provider, "{", "[", ",", " ");
    }

    private static readonly viewType = LANGUAGE_ID;

    constructor(private readonly context: ExtensionContext) { }

    private determineCompletionType(text: string, cursorIndex: number): CompletionType {
        let surroundingInfo: SurroundingTokenInfo;
        
        const ifValidElseNoCompletion =
            (completionType: CompletionType) =>
                surroundingInfo.validState ? completionType : CompletionType.NoCompletion;

        surroundingInfo = this.getSurroundingTokenInfo(text, cursorIndex, '{', '}');
        if (surroundingInfo.insideTokens) {
            return ifValidElseNoCompletion(CompletionType.Friend);
        }

        surroundingInfo = this.getSurroundingTokenInfo(text, cursorIndex, '[', ']');
        if (surroundingInfo.insideTokens) {
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
        const insideTokens = startTokenCount > 0 && (cursorIndex > startTokenFirstIdx && (cursorIndex < endTokenFirstIdx || endTokenCount === 0));

        return {
            validState,
            insideTokens,
        };
    }

    private getCompletionOptionsFromStorage(storage: ShowStorage, completionType: CompletionType): string[] {
        switch (completionType) {
            case CompletionType.Friend: return storage.listFriends();
            case CompletionType.ShowTitle: return storage.listShows();
            case CompletionType.Tag: return Object.keys(Tags);
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

    private convertToItems(alreadyTypedText: string, options: string[], completionType: CompletionType, position: Position): CompletionItem[] {
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

        const postfixesPerType = {
            [CompletionType.Friend]: '',
            [CompletionType.ShowTitle]: ':',
            [CompletionType.Tag]: ']',
            [CompletionType.Episode]: ' ',
            [CompletionType.NoCompletion]: '',
        };

        const commitCharactersPerType = {
            [CompletionType.Friend]: [',', '}'],
            [CompletionType.ShowTitle]: [],
            [CompletionType.Tag]: [],
            [CompletionType.Episode]: [],
            [CompletionType.NoCompletion]: [],
        };

        const commandPerType = {
            [CompletionType.Friend]: { title: 'Format Friend', command: 'marucs-anime.formatFriend' } as vscode.Command,
            [CompletionType.ShowTitle]: undefined,
            [CompletionType.Tag]: undefined,
            [CompletionType.Episode]: undefined,
            [CompletionType.NoCompletion]: undefined,
        };

        const createCompletionItem = (option: string): CompletionItem => {
            const commitCharacters = commitCharactersPerType[completionType];
            const textToInsert = option + postfixesPerType[completionType];
            const item = {
                label: option,
                kind: getCompletionKind(),
                insertText: textToInsert,
                keepWhitespace: true,
                range: new Range(position.translate(0, -alreadyTypedText.length), position),
                commitCharacters: commitCharacters,
                command: commandPerType[completionType]
            };
            return item;
        };

        return options.map(createCompletionItem);
    }

    private getAlreadyTypedText(lineText: string, charPosition: number, completionType: CompletionType) {
        let re: RegExp;
        switch (completionType) {
            case CompletionType.Friend:
                re = /(?<=[,{])[^,}]*$/g;
                break;
            case CompletionType.Tag:
                re = /(?<=[,[])[^,\]]*$/g;
                break;
            case CompletionType.ShowTitle:
                re = /^/g;
                break;
            default:
                re = /NOTIMPL/g;
                break;
        }

        const attStart = lineText.search(re);

        if (attStart < 0 || attStart >= lineText.length) {
            return '';
        }

        const alreadyTypedText = lineText.substring(attStart, charPosition);
        return alreadyTypedText;
    }

    public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, completionContext: CompletionContext): ProviderResult<CompletionItem[]> {
        const extension = MarucsAnime.INSTANCE;

        const text = document.lineAt(position.line).text;
        const horizPosition = position.character;

        const completionType = this.determineCompletionType(text, horizPosition);
        const completionOptions = this.getCompletionOptionsFromStorage(extension.showStorage, completionType);
        const alreadyTypedText = this.getAlreadyTypedText(text, horizPosition, completionType);
        const filteredOptions = this.filterCompletionOptions(alreadyTypedText, completionOptions);
        const completionItems = this.convertToItems(alreadyTypedText, filteredOptions, completionType, position);

        console.log();
        console.log({
            completionType,
            completionOptions,
            filteredOptions,
            completionItems
        });
        console.log({
            text,
            alreadyTypedText,
        });
        console.log();

        if (completionItems.length === 0) {
            return [{} as CompletionItem];
        }
        
        return completionItems;
    }
}