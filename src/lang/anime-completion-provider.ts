import { CancellationToken, CompletionContext, CompletionItem, CompletionItemKind, CompletionItemProvider, DocumentFilter, ExtensionContext, languages, Position, ProviderResult, TextDocument, window } from "vscode";
import AnimeDataStorage from "../cache/anime/anime-data-storage";


export default class ShowCompletionItemProvider implements CompletionItemProvider<CompletionItem> {
    public static register(context: ExtensionContext) {
        const provider = new ShowCompletionItemProvider(context);
        return languages.registerCompletionItemProvider(this.viewType, provider);
    }

    private static viewType = "anime-list";

    constructor(private readonly context: ExtensionContext) { }

    provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, completionContext: CompletionContext): ProviderResult<CompletionItem[]> {
        let animeStorage = this.context.workspaceState.get<AnimeDataStorage>("marucs-anime:storage");
        if (!animeStorage) {
            return;
        }

        let lineText = document.lineAt(position.line).text;

        let lastOpenBracketsIndex = lineText.indexOf('{');
        let insideFriendSyntax = lastOpenBracketsIndex !== -1;// && lineText.match(/\{.*\}/g);

        let lineStartCI = lineText.trim().toLowerCase();

        //Friends autocompletion
        if (insideFriendSyntax) {
            let currentFriendText = lineStartCI.substr(lastOpenBracketsIndex + 1);

            let friends = animeStorage.listFriends();
            let friendsFiltered = friends.filter(name => (name.toLowerCase().trim()).startsWith(currentFriendText));
            let friendsCompletion = friendsFiltered.map(friendName => { return { label: friendName, kind: CompletionItemKind.User } as CompletionItem; });
            return friendsCompletion;
        }

        //TODO: support other completions other than anime names

        //Show autocompletion
        let possibleAnimes = animeStorage.listAnimes().filter(animeName => (animeName.toLowerCase()).startsWith(lineStartCI));

        let animeCompletionsStr = possibleAnimes.map(animeName => animeName + ':');

        let animeCompletions = animeCompletionsStr.map(animeName => { return { label: animeName, kind: CompletionItemKind.Class } as CompletionItem; });
        return animeCompletions;
    }
}