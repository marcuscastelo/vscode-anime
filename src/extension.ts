// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import AnlParser from "./list-parser/anl-parser";

import ShowRegistry from "./core/registry/show-registry";
import * as vscode from "vscode";
import { ExtensionContext } from "vscode";
import { TextDocument } from "vscode";
import { insertDate } from "./commands/insert-date";
import { insertTime } from "./commands/insert-time";
import { insertNextEpisode } from "./commands/insert-next-episode";
import ShowHoverProvider from "./lang/hover/anime-hover-provider";
import AnimeCompletionItemProvider from "./lang/completion/anime-completion-provider";
import MADiagnosticController from "./lang/maDiagnosticCollection";
import { EXTENSION_ID, LANGUAGE_ID, MAX_CACHE_SIZE } from "./constants";
import { formatFriend } from "./commands/format-friend";
import { clearCache } from "./commands/clear-cache";
import ShowDefinitionProvider from "./lang/definition/anime-definition-provider";
import TagsLensProvider from "./lang/code-lens/tags-codelens-provider";
import EpisodeLensProvider from "./lang/code-lens/episode-code-lens-provider";
import { TagRegistry } from "./core/registry/tag-registry";
import { registerDefaultTags } from "./core/tag";
import ShowSymbolProvider from "./lang/symbol/anime-symbol-provider";
import { AnlParserCacheManager } from "./list-parser/anl-parser-cache";
import { LineInfo } from "./list-parser/line-info";
import { Show } from "./core/show";

type ExtensionActivationState =
  | { activated: true; context: ExtensionContext }
  | { activated: false };

export class MarucsAnime {
  public static readonly INSTANCE: MarucsAnime = new MarucsAnime();

  private activationState: ExtensionActivationState = { activated: false };
  get activated() {
    return this.activationState.activated;
  }
  get context() {
    return (
      (this.activationState.activated && this.activationState.context) ||
      undefined
    );
  }

  private readonly diagnosticController;
  public readonly showRegistry: ShowRegistry = new ShowRegistry();
  public readonly tagRegistry: TagRegistry = new TagRegistry();

  private parserCache: AnlParserCacheManager | undefined = undefined;
  private constructor() {
    this.diagnosticController = this.createDiagnosticCollections();

    registerDefaultTags(this.tagRegistry);
  }

  public activate(context: ExtensionContext) {
    if (this.activated) {
      return;
    }

    this.activationState = { activated: true, context };

    this.registerSubscriptions(context);

    this.parserCache = new AnlParserCacheManager(context);

    if (vscode.window.activeTextEditor) {
      this.reactToDocumentChange(
        context,
        vscode.window.activeTextEditor.document,
      );
    }
  }

  public reactToDocumentChange(
    context: ExtensionContext,
    document: vscode.TextDocument,
  ) {
    if (document.languageId !== LANGUAGE_ID) {
      return;
    }

    const cache = this.parserCache?.findValidCache(document);

    this.showRegistry.clear();
    if (cache) {
      const showRegistry = ShowRegistry.fromJson<Show, ShowRegistry>(
        cache.jsonCache,
        () => new ShowRegistry(),
      );
      this.showRegistry.incorporate(showRegistry);
    }

    // If last cache is invalid or incomplete (sub-cache), we need to parse the document
    const needsParsing =
      !cache || cache.validity.lineCount !== document.lineCount;

    if (needsParsing) {
      if (!cache) {
        console.log(
          "[marucs-anime::cache] No valid cache found, parsing document",
        );
      } else if (cache.validity.lineCount !== document.lineCount) {
        console.log(
          "[marucs-anime::cache] Incomplete cache found, parsing document",
        );
      }

      this.diagnosticController.clearDiagnostics();

      this.scanDocument(context, document);
    }
  }

  public scanDocument(
    _context: ExtensionContext,
    document: vscode.TextDocument,
  ) {
    this.diagnosticController.setCurrentDocument(document);

    vscode.window.setStatusBarMessage(`Parsing all lines...`);
    this.updateShowRegistry(document);

    const currentCacheCount = this.parserCache?.listCaches().length || 0;
    vscode.window.setStatusBarMessage(
      `Parsing completed! Cache count: ${currentCacheCount}`,
    );
  }

  public clearCache() {
    this.parserCache?.clearCaches();
  }

  private updateShowRegistry(textDocument: TextDocument) {
    const showRegistrySupplier = () => this.showRegistry;
    const parser = new AnlParser(
      showRegistrySupplier,
      this.diagnosticController,
    );

    const lineOfCheckpoint = (checkpointIdx: number) => {
      if (checkpointIdx === MAX_CACHE_SIZE - 1) {
        return textDocument.lineCount - 1;
      }

      const k = MAX_CACHE_SIZE;
      const L = 0.995; // k-1th checkpoint will only miss 0.5% of the document
      const n = textDocument.lineCount;
      const x = checkpointIdx + 1;

      const offsetPerc = (1 / (k - 1)) * L;
      const mainPerc = 1 / x;

      let perc = mainPerc - offsetPerc;
      perc = Math.max(Math.min(perc, 1), 0);

      const remainingLines = Math.floor(n * perc);
      return textDocument.lineCount - remainingLines - 1;
    };

    parser.parseDocument(textDocument, {
      alreadyProccessedLineCount:
        this.parserCache?.findValidCache(textDocument)?.validity.lineCount,
      listener: (lineInfo: LineInfo) => {
        const line = lineInfo.line.lineNumber;
        const checkpoints = Array.from({ length: MAX_CACHE_SIZE }, (_, i) =>
          lineOfCheckpoint(i),
        );

        const dedupedCheckpoints = Array.from(new Set(checkpoints));

        if (dedupedCheckpoints.includes(line)) {
          console.log(
            `[marucs-anime] Registering parsing checkpoint at ${line}`,
          );
          this.parserCache?.onCheckpoint({
            showRegistry: this.showRegistry,
            document: textDocument,
            lineCount: line + 1,
          });
        }
      },
    });
    console.log(
      `[marucs-anime] Show registry updated! length: ${this.showRegistry.toJson().length} `,
    );
  }

  private createDiagnosticCollections() {
    return MADiagnosticController.register(EXTENSION_ID);
  }

  private registerSubscriptions(context: ExtensionContext) {
    context.subscriptions.push(
      vscode.window.onDidChangeActiveTextEditor(
        (editor) =>
          editor && this.reactToDocumentChange(context, editor.document),
      ),
      vscode.workspace.onDidSaveTextDocument(
        (document) => document && this.reactToDocumentChange(context, document),
      ),
      vscode.workspace.onDidCloseTextDocument(
        (document) => document && this.diagnosticController.clearDiagnostics(),
      ),

      vscode.commands.registerTextEditorCommand(
        "marucs-anime.insertDate",
        insertDate,
      ),
      vscode.commands.registerTextEditorCommand(
        "marucs-anime.insertTime",
        insertTime,
      ),
      vscode.commands.registerTextEditorCommand(
        "marucs-anime.insertNextEpisode",
        insertNextEpisode,
      ),
      vscode.commands.registerTextEditorCommand(
        "marucs-anime.formatFriend",
        formatFriend,
      ),
      vscode.commands.registerTextEditorCommand(
        "marucs-anime.clearCache",
        clearCache,
      ),

      ShowHoverProvider.register(context),
      AnimeCompletionItemProvider.register(context),
      EpisodeLensProvider.register(context),
      TagsLensProvider.register(context),
      ShowDefinitionProvider.register(context),
      ShowSymbolProvider.register(context),
    );
  }
}
