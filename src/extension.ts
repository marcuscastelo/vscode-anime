// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import DocumentReader from './utils/document-reader';
import LineProcessor from './list-parser/line-processor';

import ShowStorage from './cache/anime/showStorage';
import * as vscode from 'vscode';
import { ExtensionContext } from 'vscode';
import { TextDocument } from 'vscode';
import { insertDate } from './commands/insert-date';
import { insertTime } from './commands/insert-time';
import { insertNextEpisode } from './commands/insert-next-episode';
import ShowHoverProvider from './lang/anime-hover-provider';
import AnimeCompletionItemProvider from './lang/anime-completion-provider';
import MADiagnosticController from './lang/maDiagnosticCollection';
import { ANIME_STORAGE_ID, EXTENSION_ID, LANGUAGE_ID } from './constants';
import ShowLensProvider from './lang/anime-codelens-provider';
import { formatFriend } from './commands/format-friend';
import ShowDefinitionProvider from './lang/anime-definition-provider';

export class MarucsAnime {
    private static _INSTANCE: MarucsAnime;
    static get INSTANCE() { return MarucsAnime._INSTANCE; }

    public static activate(context: ExtensionContext): MarucsAnime | null {
        if (MarucsAnime._INSTANCE) {
            console.error("Trying to activate Marucs' Anime multiple times!");
            return null;
        }

        MarucsAnime._INSTANCE = new MarucsAnime(context);;
        
        return MarucsAnime._INSTANCE;
    }

    private readonly diagnosticController;

    private constructor(
        private readonly context: ExtensionContext
    ) {
        this.diagnosticController = this.createDiagnosticCollections();
        this.registerSubscriptions();

        if (vscode.window.activeTextEditor) { // If there is an active editor, we start scanning it already (events are not fired)
            this.reactToDocumentChange(vscode.window.activeTextEditor.document);
        }
    }

    get showStorage(): ShowStorage {
        let animeStorage = this.context.workspaceState.get<ShowStorage>(ANIME_STORAGE_ID);

        if (!animeStorage) {
            animeStorage = new ShowStorage();
            this.overwriteAnimeStorage(animeStorage);
        }

        return animeStorage;
    }

    public reactToDocumentChange(document: vscode.TextDocument) {
        this.diagnosticController.clearDiagnostics();

        if (document.languageId !== LANGUAGE_ID) {
            return;
        }

        this.scanDocument(document);
    }
    
    public scanDocument(document: vscode.TextDocument) {
        this.diagnosticController.setCurrentDocument(document);

        vscode.window.setStatusBarMessage(`Parsing all lines...`);
        let animeStorage = this.createStorageFromEntireDocument(document);

        this.overwriteAnimeStorage(animeStorage);
        vscode.window.setStatusBarMessage(`Parsing completed!`,);
    }

    public overwriteAnimeStorage(storage: ShowStorage) {
        this.context.workspaceState.update(ANIME_STORAGE_ID, storage);
    }

    private createStorageFromEntireDocument(textDocument: TextDocument): ShowStorage {
        let storage = new ShowStorage();
        let parser = new LineProcessor(storage, this.diagnosticController);
        parser.processDocument(textDocument);

        return storage;
    }

    private createDiagnosticCollections() {
        return MADiagnosticController.register(this.context, EXTENSION_ID);
    }

    private registerSubscriptions() {
        this.context.subscriptions.push(
            vscode.window.onDidChangeActiveTextEditor(editor => editor && this.reactToDocumentChange(editor.document)),
            vscode.workspace.onDidSaveTextDocument(document => document && this.reactToDocumentChange(document)),
            vscode.workspace.onDidCloseTextDocument(document => document && this.diagnosticController.clearDiagnostics()),

            vscode.commands.registerTextEditorCommand('marucs-anime.insertDate', insertDate),
            vscode.commands.registerTextEditorCommand('marucs-anime.insertTime', insertTime),
            vscode.commands.registerTextEditorCommand('marucs-anime.insertNextEpisode', insertNextEpisode),
            vscode.commands.registerTextEditorCommand('marucs-anime.formatFriend', formatFriend),
        
            ShowHoverProvider.register(this.context),
            AnimeCompletionItemProvider.register(this.context),
            ShowLensProvider.register(this.context),
            ShowDefinitionProvider.register(this.context),
        );
    }
}