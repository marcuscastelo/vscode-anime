// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import DocumentReader from './utils/document-reader';
import AnimeContextfulParser from './list-parser/anime-contextful-parser';

import AnimeDataStorage from './cache/anime/anime-data-storage';
import findContext from './list-parser/anime-context-finder';
import * as vscode from 'vscode';
import { ExtensionContext } from 'vscode';
import { TextEditor } from 'vscode';
import { TextEditorEdit } from 'vscode';
import { DocumentFilter } from 'vscode';
import { TextDocument } from 'vscode';
import { Position } from 'vscode';
import { CancellationToken } from 'vscode';
import { MarkdownString } from 'vscode';
import { ProviderResult } from 'vscode';
import { Hover } from 'vscode';
import { TextLine } from 'vscode';
import { Selection } from 'vscode';
import { insertDate } from './commands/insert-date';
import { insertTime } from './commands/insert-time';
import { insertNextEpisode } from './commands/insert-next-episode';
import ShowHoverProvider from './lang/anime-hover-provider';
import AnimeCompletionItemProvider from './lang/anime-completion-provider';
import MADiagnosticController from './lang/maDiagnosticCollection';

let extensionContext: ExtensionContext;

export function getContext() {
	return extensionContext;
}


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	extensionContext = context;
	MAExtension.activate(context);
}


// this method is called when your extension is deactivated
export function deactivate() { }


class MAExtension {
	public static activate(context: ExtensionContext) {
		const extension = new MAExtension(context);
		//TODO: read again when textEditor changes
		if (vscode.window.activeTextEditor) {
			extension.readEntireDocument(vscode.window.activeTextEditor.document);
		}
		extension.registerMembers();
	}

	private constructor(private readonly context: ExtensionContext) { }

	private readEntireDocument(document: TextDocument) {

		vscode.window.setStatusBarMessage(`Parsing all animes...`);
		let animeStorage = this.parseDocumentFromStart(document);

		console.log(animeStorage);

		extensionContext.workspaceState.update("marucs-anime:storage", animeStorage);
		vscode.window.setStatusBarMessage(`Parsing completed!`,);
	}

	private parseDocumentFromStart(textDocument: TextDocument): AnimeDataStorage {
		let diagnosticController = MADiagnosticController.register(this.context, 'vscode-anime');
		let reader = new DocumentReader(textDocument);
		let animeStorage = new AnimeDataStorage();

		let contextParser = new AnimeContextfulParser(animeStorage, reader, diagnosticController);

		let currentLine: TextLine | null = reader.getline();
		while (currentLine !== null) {

			if (reader.currentLineIdx % Math.floor(reader.document.lineCount / 10) === 0) {
				console.log(`${reader.currentLineIdx}/${reader.document.lineCount} lines read (${(reader.currentLineIdx / reader.document.lineCount * 100).toFixed(2)}%)`);
			}

			contextParser.processLine(currentLine);
			currentLine = reader.getline();
		}

		return animeStorage;
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