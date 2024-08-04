import {
  CancellationToken,
  DocumentSymbolProvider,
  ExtensionContext,
  languages,
  Location,
  ProviderResult,
  Range,
  SymbolInformation,
  SymbolKind,
  TextDocument,
} from "vscode";
import { Show } from "../../core/show";
import { LANGUAGE_ID } from "../../constants";
import { MarucsAnime } from "../../extension";

export default class ShowSymbolProvider implements DocumentSymbolProvider {
  public static register(context: ExtensionContext) {
    const provider = new ShowSymbolProvider(context);
    return languages.registerDocumentSymbolProvider(this.viewType, provider);
  }

  private static readonly viewType = LANGUAGE_ID;

  constructor(private readonly context: ExtensionContext) {}

  public provideDocumentSymbols(
    document: TextDocument,
    _token: CancellationToken,
  ): ProviderResult<SymbolInformation[]> {
    const shows = [...MarucsAnime.INSTANCE.showStorage.iterShows()];
    const showToSymbol = (show: Show) =>
      <SymbolInformation>{
        name: show.title,
        kind: SymbolKind.Class,
        location: new Location(
          document.uri,
          new Range(
            show.firstMentionedLine,
            0,
            show.firstMentionedLine,
            show.title.length - 1,
          ),
        ),
      };

    const result = shows.map(showToSymbol);
    return result;
  }
}
