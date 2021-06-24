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

export function activate(context: ExtensionContext) {
	MAExtension.activate(context);
}

export function deactivate() {
	console.log("Deactivating!");
}

export class MAExtension {
	private static _INSTANCE: MAExtension;
	static get INSTANCE() { return MAExtension._INSTANCE; }

	private static readonly ANIME_STORAGE_ID = 'marucs-anime:storage';

	public static activate(context: ExtensionContext) {
		if (MAExtension._INSTANCE) {
			console.warn("Trying to activate Marucs' Anime multiple times!");
			return;
		}

		const extension = new MAExtension(context);
		MAExtension._INSTANCE = extension;

		context.subscriptions.push(
			vscode.window.onDidChangeActiveTextEditor(editor => editor && extension.rescanDocument(editor.document)),
			vscode.workspace.onDidSaveTextDocument(document => document && extension.rescanDocument(document)),
			vscode.workspace.onDidCloseTextDocument(document => document && extension.diagnosticController.clearDiagnostics()),
		);

		if (vscode.window.activeTextEditor)
			extension.rescanDocument(vscode.window.activeTextEditor?.document)

		extension.registerMembers();
	}

	private readonly diagnosticController;

	private constructor(
		private readonly context: ExtensionContext
	) {
		this.diagnosticController = MADiagnosticController.register(this.context, 'vscode-anime');
	}

	get showStorage(): ShowStorage {
		let animeStorage = this.context.workspaceState.get<ShowStorage>(MAExtension.ANIME_STORAGE_ID);

		if (!animeStorage) {
			animeStorage = new ShowStorage();
			this.context.workspaceState.update(MAExtension.ANIME_STORAGE_ID, animeStorage);
		}

		return animeStorage;
	}

	public rescanDocument(document: vscode.TextDocument) {
		if (document.languageId !== 'anime-list') {
			this.diagnosticController.clearDiagnostics();
			return;
		}

		this.diagnosticController.clearDiagnostics();
		this.diagnosticController.setCurrentDocument(document);

		vscode.window.setStatusBarMessage(`Parsing all lines...`);
		let animeStorage = this.createStorageFromEntireDocument(document);

		this.overwriteAnimeStorage(animeStorage);
		vscode.window.setStatusBarMessage(`Parsing completed!`,);
	}

	public overwriteAnimeStorage(storage: ShowStorage) {
		this.context.workspaceState.update(MAExtension.ANIME_STORAGE_ID, storage);
	}

	//TODO? move
	private createStorageFromEntireDocument(textDocument: TextDocument): ShowStorage {
		let storage = new ShowStorage();
		let parser = new LineProcessor(storage, this.diagnosticController);
		parser.processAllLines(textDocument);

		return storage;
	}

	private registerMembers() {
		this.context.subscriptions.push(
			vscode.commands.registerTextEditorCommand('marucs-anime.insertDate', insertDate),
			vscode.commands.registerTextEditorCommand('marucs-anime.insertTime', insertTime),
			vscode.commands.registerTextEditorCommand('marucs-anime.insertNextEpisode', insertNextEpisode),

			ShowHoverProvider.register(this.context),
			AnimeCompletionItemProvider.register(this.context),
		);
	}
}