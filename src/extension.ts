// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import DocumentReader from './utils/document-reader';
import LineProcessor from './list-parser/line-processor';

import ShowStorage from './cache/anime/show-storage';
import * as vscode from 'vscode';
import { ExtensionContext } from 'vscode';
import { TextDocument } from 'vscode';
import { insertDate } from './commands/insert-date';
import { insertTime } from './commands/insert-time';
import { insertNextEpisode } from './commands/insert-next-episode';
import ShowHoverProvider from './lang/anime-hover-provider';
import AnimeCompletionItemProvider from './lang/anime-completion-provider';
import MADiagnosticController from './lang/maDiagnosticCollection';
import { SHOW_STORAGE_ID as SHOW_STORAGE_ID, EXTENSION_ID, LANGUAGE_ID, TAG_REGISTRY_ID } from './constants';
import ShowLensProvider from './lang/anime-codelens-provider';
import { formatFriend } from './commands/format-friend';
import ShowDefinitionProvider from './lang/anime-definition-provider';
import { TagRegistry } from './core/registry/tag-registry';
import { registerDefaultTags } from './core/tag';
import ShowSymbolProvider from './lang/anime-symbol-provider';

type ExtensionActivationState = { activated: true, context: ExtensionContext } | { activated: false };

export class MarucsAnime {
    public static readonly INSTANCE: MarucsAnime = new MarucsAnime();

    private activationState: ExtensionActivationState = { activated: false };
    get activated() { return this.activationState.activated; }
    get context() { return  this.activationState.activated && this.activationState.context || undefined; }

    private readonly diagnosticController;
    public readonly showStorage: ShowStorage = new ShowStorage();
    public readonly tagRegistry: TagRegistry = new TagRegistry();

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

        if (vscode.window.activeTextEditor) { // If there is an active editor, we start scanning it already (events are not fired)
            this.reactToDocumentChange(context, vscode.window.activeTextEditor.document);
        }
    }

    public reactToDocumentChange(context: ExtensionContext, document: vscode.TextDocument) {
        this.diagnosticController.clearDiagnostics();

        if (document.languageId !== LANGUAGE_ID) {
            return;
        }

        this.scanDocument(context, document);
    }
    
    public scanDocument(context: ExtensionContext, document: vscode.TextDocument) {
        this.diagnosticController.setCurrentDocument(document);

        vscode.window.setStatusBarMessage(`Parsing all lines...`);
        this.updateShowStorage(document);

        this.showStorage.save(context, SHOW_STORAGE_ID);
        vscode.window.setStatusBarMessage(`Parsing completed!`,);
    }

    private updateShowStorage(textDocument: TextDocument) {
        this.showStorage.clear();
        const showStorageSupplier = () => this.showStorage;
        let parser = new LineProcessor(showStorageSupplier, this.diagnosticController);
        parser.processDocument(textDocument);
    }

    private createDiagnosticCollections() {
        return MADiagnosticController.register(EXTENSION_ID);
    }

    private registerSubscriptions(context: ExtensionContext) {
        context.subscriptions.push(
            vscode.window.onDidChangeActiveTextEditor(editor => editor && this.reactToDocumentChange(context, editor.document)),
            vscode.workspace.onDidSaveTextDocument(document => document && this.reactToDocumentChange(context, document)),
            vscode.workspace.onDidCloseTextDocument(document => document && this.diagnosticController.clearDiagnostics()),

            vscode.commands.registerTextEditorCommand('marucs-anime.insertDate', insertDate),
            vscode.commands.registerTextEditorCommand('marucs-anime.insertTime', insertTime),
            vscode.commands.registerTextEditorCommand('marucs-anime.insertNextEpisode', insertNextEpisode),
            vscode.commands.registerTextEditorCommand('marucs-anime.formatFriend', formatFriend),
        
            ShowHoverProvider.register(context),
            AnimeCompletionItemProvider.register(context),
            ShowLensProvider.register(context),
            ShowDefinitionProvider.register(context),
            ShowSymbolProvider.register(context),
        );
    }
}