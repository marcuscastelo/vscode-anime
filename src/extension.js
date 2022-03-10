"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAExtension = exports.deactivate = exports.activate = void 0;
const line_processor_1 = require("./list-parser/line-processor");
const showStorage_1 = require("./cache/anime/showStorage");
const vscode = require("vscode");
const insert_date_1 = require("./commands/insert-date");
const insert_time_1 = require("./commands/insert-time");
const insert_next_episode_1 = require("./commands/insert-next-episode");
const anime_hover_provider_1 = require("./lang/anime-hover-provider");
const anime_completion_provider_1 = require("./lang/anime-completion-provider");
const maDiagnosticCollection_1 = require("./lang/maDiagnosticCollection");
function activate(context) {
    MAExtension.activate(context);
}
exports.activate = activate;
function deactivate() {
    console.log("Deactivating!");
}
exports.deactivate = deactivate;
class MAExtension {
    constructor(context) {
        this.context = context;
        this.diagnosticController = maDiagnosticCollection_1.default.register(this.context, 'vscode-anime');
    }
    static get INSTANCE() { return MAExtension._INSTANCE; }
    static activate(context) {
        if (MAExtension._INSTANCE) {
            console.warn("Trying to activate Marucs' Anime multiple times!");
            return;
        }
        const extension = new MAExtension(context);
        MAExtension._INSTANCE = extension;
        context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(editor => editor && extension.rescanDocument(editor.document)), vscode.workspace.onDidSaveTextDocument(document => document && extension.rescanDocument(document)), vscode.workspace.onDidCloseTextDocument(document => document && extension.diagnosticController.clearDiagnostics()));
        if (vscode.window.activeTextEditor)
            extension.rescanDocument(vscode.window.activeTextEditor?.document);
        extension.registerMembers();
    }
    get showStorage() {
        let animeStorage = this.context.workspaceState.get(MAExtension.ANIME_STORAGE_ID);
        if (!animeStorage) {
            animeStorage = new showStorage_1.default();
            this.context.workspaceState.update(MAExtension.ANIME_STORAGE_ID, animeStorage);
        }
        return animeStorage;
    }
    rescanDocument(document) {
        if (document.languageId !== 'anime-list') {
            this.diagnosticController.clearDiagnostics();
            return;
        }
        this.diagnosticController.clearDiagnostics();
        this.diagnosticController.setCurrentDocument(document);
        vscode.window.setStatusBarMessage(`Parsing all lines...`);
        let animeStorage = this.createStorageFromEntireDocument(document);
        this.overwriteAnimeStorage(animeStorage);
        vscode.window.setStatusBarMessage(`Parsing completed!`);
    }
    overwriteAnimeStorage(storage) {
        this.context.workspaceState.update(MAExtension.ANIME_STORAGE_ID, storage);
    }
    //TODO? move
    createStorageFromEntireDocument(textDocument) {
        let storage = new showStorage_1.default();
        let parser = new line_processor_1.default(storage, this.diagnosticController);
        parser.processAllLines(textDocument);
        return storage;
    }
    registerMembers() {
        this.context.subscriptions.push(vscode.commands.registerTextEditorCommand('marucs-anime.insertDate', insert_date_1.insertDate), vscode.commands.registerTextEditorCommand('marucs-anime.insertTime', insert_time_1.insertTime), vscode.commands.registerTextEditorCommand('marucs-anime.insertNextEpisode', insert_next_episode_1.insertNextEpisode), anime_hover_provider_1.default.register(this.context), anime_completion_provider_1.default.register(this.context));
    }
}
exports.MAExtension = MAExtension;
MAExtension.ANIME_STORAGE_ID = 'marucs-anime:storage';
//# sourceMappingURL=extension.js.map