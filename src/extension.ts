// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import DocumentReader from './utils/document-reader';
import MALineParser from './list-parser/anime-contextful-parser';

import AnimeDataStorage from './cache/anime/anime-data-storage';
import * as vscode from 'vscode';
import { ExtensionContext } from 'vscode';
import { TextDocument } from 'vscode';
import { insertDate } from './commands/insert-date';
import { insertTime } from './commands/insert-time';
import { insertNextEpisode } from './commands/insert-next-episode';
import ShowHoverProvider from './lang/anime-hover-provider';
import AnimeCompletionItemProvider from './lang/anime-completion-provider';
import MADiagnosticController from './lang/maDiagnosticCollection';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	MAExtension.activate(context);
}


// this method is called when your extension is deactivated
export function deactivate() { }

export class MAExtension {
	private static _INSTANCE: MAExtension;
	static get INSTANCE() { return MAExtension._INSTANCE; }

	public static activate(context: ExtensionContext) {
		if (MAExtension._INSTANCE) {
			console.warn("Trying to activate Marucs' Anime multiple times!");
			return;
		}

		const extension = new MAExtension(context);
		MAExtension._INSTANCE = extension;

		vscode.window.onDidChangeActiveTextEditor(extension.updateAnimeStorage);
		extension.updateAnimeStorage();

		extension.registerMembers();
	}

	private static readonly ANIME_STORAGE_ID = 'marucs-anime:storage';

	private constructor(
		private readonly context: ExtensionContext
	) {

	}

	get animeStorage(): AnimeDataStorage {
		let animeStorage = this.context.workspaceState.get<AnimeDataStorage>(MAExtension.ANIME_STORAGE_ID);

		if (!animeStorage) {
			animeStorage = new AnimeDataStorage();
			this.context.workspaceState.update(MAExtension.ANIME_STORAGE_ID, animeStorage);
		}

		return animeStorage;
	}

	public updateAnimeStorage() {
		if (!vscode.window.activeTextEditor) {
			vscode.window.showErrorMessage("Couldn't update anime storage, no text editor is currently active")
			return;
		}

		this.animeStorage

		vscode.window.setStatusBarMessage(`Parsing all lines...`);
		let animeStorage = this.createStorageFromEntireDocument(vscode.window.activeTextEditor.document);

		console.log(animeStorage);

		this.overwriteAnimeStorage(animeStorage);
		vscode.window.setStatusBarMessage(`Parsing completed!`,);
	}

	public overwriteAnimeStorage(storage: AnimeDataStorage) {
		this.context.workspaceState.update(MAExtension.ANIME_STORAGE_ID, storage);
	}

	//TODO? move
	private createStorageFromEntireDocument(textDocument: TextDocument): AnimeDataStorage {
		let diagnosticController = MADiagnosticController.register(this.context, 'vscode-anime');
		let storage = new AnimeDataStorage();
		let parser = new MALineParser(storage, diagnosticController);
		parser.processAllLines(textDocument);

		return storage;
	}

	private registerMembers() {
		this.context.subscriptions.push(
			vscode.commands.registerTextEditorCommand('marucs-anime.insertDate', insertDate),
			vscode.commands.registerTextEditorCommand('marucs-anime.insertTime', insertTime),
			vscode.commands.registerTextEditorCommand('marucs-anime.insertNextEpisode', (a, b) => insertNextEpisode(a, b)),

			ShowHoverProvider.register(this.context),
			AnimeCompletionItemProvider.register(this.context),
		);
	}
}