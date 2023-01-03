import { CancellationToken, DocumentSymbol, DocumentSymbolProvider, ExtensionContext, languages, Location, ProviderResult, Range, SymbolInformation, SymbolKind, TextDocument } from "vscode";
import { Show } from "../cache/anime/shows";
import { LANGUAGE_ID } from "../constants";
import { MarucsAnime } from "../extension";

export default class ShowSymbolProvider implements DocumentSymbolProvider {
    public static register(context: ExtensionContext) {
        const provider = new ShowSymbolProvider(context);
        return languages.registerDocumentSymbolProvider(this.viewType, provider);
    }

    private static readonly viewType = LANGUAGE_ID;

    constructor(private readonly context: ExtensionContext) { }

    public provideDocumentSymbols(document: TextDocument, token: CancellationToken): ProviderResult<SymbolInformation[]> {
        const shows = [...MarucsAnime.INSTANCE.showStorage.iterShows()];
        const showToSymbol = (show: Show) => (<SymbolInformation>{
            name: show.info.title,
            kind: SymbolKind.Class,
            location: new Location(document.uri, new Range(show.info.firstMentionedLine, 0, show.info.firstMentionedLine, show.info.title.length-1)),
        });

        const result = shows.map(showToSymbol);
        return result;
    }
}