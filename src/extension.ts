/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */
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
import ShowHoverProvider from './anime-hover-provider';

let extensionContext: ExtensionContext;

export function getContext() {
	return extensionContext;
}

function parseDocumentFromStart(textDocument: TextDocument): AnimeDataStorage {
	let reader = new DocumentReader(textDocument);
	let animeStorage = new AnimeDataStorage();

	let contextParser = new AnimeContextfulParser(animeStorage, reader);

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

function updateAnimeStorage(textDocument: TextDocument) {
	vscode.window.setStatusBarMessage(`Parsing all animes...`);
	let animeStorage = parseDocumentFromStart(textDocument);

	console.log(animeStorage);

	extensionContext.workspaceState.update("marucs-anime:storage", animeStorage);
	vscode.window.setStatusBarMessage(`Parsing completed!`,);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext) {
	extensionContext = context;
	let textEditor = vscode.window.activeTextEditor;

	if (!vscode.window.activeTextEditor) {
		vscode.window.showErrorMessage("vscode-anime couldn't find a TextEditor");
		return;
	}

	updateAnimeStorage(vscode.window.activeTextEditor.document);
	vscode.workspace.onDidSaveTextDocument((e) => void updateAnimeStorage(e));

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('marucs-anime.insertDate', insertDate),
		vscode.commands.registerTextEditorCommand('marucs-anime.insertTime', insertTime),
		vscode.commands.registerTextEditorCommand('marucs-anime.insertNextEpisode', (a, b) => insertNextEpisode(a, b)),

	);

	let animelistFilter: DocumentFilter = {
		language: "anime-list",
	};

	let completionItemProvider: vscode.CompletionItemProvider<vscode.CompletionItem> = {
        provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, completionContext: vscode.CompletionContext): ProviderResult<vscode.CompletionItem[]> {
			if (!vscode.window.activeTextEditor) return;

			let animeStorage = context.workspaceState.get<AnimeDataStorage>("marucs-anime:storage");
			if (!animeStorage) return;

			let lineText = document.lineAt(position.line).text;

			let lastOpenBracketsIndex = lineText.indexOf('{');
			let insideFriendSyntax = lastOpenBracketsIndex !== -1 ;// && lineText.match(/\{.*\}/g);
			
			
			let lineStartCI = lineText.trim().toLowerCase();
			
			//Friends autocompletion
			if (insideFriendSyntax) {
				let currentFriendText = lineStartCI.substr(lastOpenBracketsIndex+1);

				let friends = animeStorage.listFriends();
				let friendsFiltered = friends.filter(name => (name.toLowerCase().trim()).startsWith(currentFriendText));
				let friendsCompletion = friendsFiltered.map(friendName => { return { label: friendName, kind: vscode.CompletionItemKind.User } as vscode.CompletionItem; });
				return friendsCompletion;
			}

			//TODO: support other completions other than anime names

			//Anime autocompletion

			let possibleAnimes = animeStorage.listAnimes().filter(animeName => (animeName.toLowerCase()).startsWith(lineStartCI));

			let strCompletions = possibleAnimes.map(animeName => animeName + ':');

			let completions = strCompletions.map(animeName => { return { label: animeName , kind: vscode.CompletionItemKind.Class } as vscode.CompletionItem; });
			return completions;
		}
	};

	context.subscriptions.push(
		ShowHoverProvider.register(context),
		vscode.languages.registerCompletionItemProvider(animelistFilter, completionItemProvider),
	);
	
}


// this method is called when your extension is deactivated
export function deactivate() { }
