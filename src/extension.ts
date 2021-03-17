/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import DocumentReader from './utils/document-reader';
import AnimeContextfulParser from './list-parser/anime-contextful-parser';

import AnimeDataStorage from './anime-data-storage';
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

let extensionContext: ExtensionContext | null;

function readFileIntoAnimeData(textEditor: TextEditor): AnimeDataStorage {
	let reader = new DocumentReader(textEditor.document);

	let animeStorage = new AnimeDataStorage();

	let contextParser = new AnimeContextfulParser(animeStorage);

	let currentLine: TextLine | null = reader.getline();
	while (currentLine !== null) {

		if (reader.currentLineIdx % (reader.document.lineCount / 10)) {
			console.log(`${reader.currentLineIdx}/${reader.document.lineCount} lines read (${(reader.currentLineIdx / reader.document.lineCount * 100).toFixed(2)}%)`);
		}

		contextParser.processLine(currentLine);
		currentLine = reader.getline();
	}

	return animeStorage;
}


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	extensionContext = context;

	let animeStorage: AnimeDataStorage;


	if (vscode.window.activeTextEditor) {
		console.log("Reading document lines...");
		animeStorage = readFileIntoAnimeData(vscode.window.activeTextEditor);
		console.log("All document lines read!");

		console.log(animeStorage);
		context.workspaceState.update("marucs-anime:storage", animeStorage);
	}

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('marucs-anime.insertDate', insertDate),
		vscode.commands.registerTextEditorCommand('marucs-anime.insertTime', insertTime),
		vscode.commands.registerTextEditorCommand('marucs-anime.insertNextEpisode', (a, b) => insertNextEpisode(a, b, animeStorage)),

	);

	let animelistFilter: DocumentFilter = {
		language: "anime-list",
	};


	let hoverProvider = {
		provideHover(document: TextDocument, position: Position, token: CancellationToken) {
			if (!vscode.window.activeTextEditor) return;

			let animeStorage = context.workspaceState.get<AnimeDataStorage>("marucs-anime:storage");
			if (!animeStorage) return;

			let animeContext = findContext(vscode.window.activeTextEditor, position.line);

			let animeInfo =  animeStorage.getAnime(animeContext.currAnimeName);
			if (!animeInfo) {
				throw new Error("Impossible state");
			}

			let mdString;

			mdString = new MarkdownString(
				`### ${animeContext.currAnimeName}: ` +
				`\n- Last episode: ${animeInfo.lastEp}`
			);


			return new Hover(mdString);
		}
	};

	let completionItemProvider: vscode.CompletionItemProvider<vscode.CompletionItem> = {
        provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, completionContext: vscode.CompletionContext): ProviderResult<vscode.CompletionItem[]> {
			if (!vscode.window.activeTextEditor) return;

			let animeStorage = context.workspaceState.get<AnimeDataStorage>("marucs-anime:storage");
			if (!animeStorage) return;

			//TODO: support other completions other than anime names

			let lineStart = document.lineAt(position.line).text.trim();

			let possibleAnimes = animeStorage.listAnimes().filter(animeName => animeName.startsWith(lineStart));

			let strCompletions = possibleAnimes.map(animeName => animeName + ':');

			let completions = strCompletions.map(animeName => { return { label: animeName , kind: vscode.CompletionItemKind.Class } as vscode.CompletionItem; });
			return completions;
		}
	};

	context.subscriptions.push(
		vscode.languages.registerHoverProvider(animelistFilter, hoverProvider),
		vscode.languages.registerCompletionItemProvider(animelistFilter, completionItemProvider),
	);
	
}


// this method is called when your extension is deactivated
export function deactivate() { }
