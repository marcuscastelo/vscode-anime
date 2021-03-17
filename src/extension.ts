/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import DocumentReader from './document-reader';
import AnimeContextfulParser from './anime-contextful-parser';

import AnimeDataStore from './anime-data-store';
import findContext from './anime-context-finder';
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

let extensionContext: ExtensionContext | null;

function isEditingSimpleCursor(textEditor: TextEditor) {
	return textEditor.selections.length === 1 && textEditor.selection.isSingleLine && textEditor.selection.start === textEditor.selection.end;
}

function insertDate(textEditor: TextEditor, edit: TextEditorEdit): void {
	if (!isEditingSimpleCursor(textEditor)) return;

	let currDate = (new Date(Date.now())).toLocaleDateString();

	edit.insert(textEditor.selection.active, currDate);
}

function insertTime(textEditor: TextEditor, edit: TextEditorEdit): void {
	if (!isEditingSimpleCursor(textEditor)) return;

	let currTime = (new Date(Date.now())).toLocaleTimeString(undefined, {
		hour: `2-digit`,
		minute: `2-digit`
	});

	let currentLineText = textEditor.document.lineAt(textEditor.selection.start.line).text;


	let emptyLine = currentLineText.match(/^\s*$/g) !== null;
	let half_way = currentLineText.match(/^\s*(\d{2}:\d{2})\s*\-?\s*$/g) !== null;
	let has_dash = currentLineText.indexOf('-');

	if (!emptyLine && !half_way) return;

	if (half_way) {
		if (!has_dash) currTime = ' - ' + currTime.trim();
		currTime += ' ';
	}
	else if (emptyLine) currTime += currentLineText.endsWith(' ') ? '- ' : ' - ';
	edit.insert(textEditor.selection.active, currTime);
}


function readFileIntoAnimeData(textEditor: TextEditor): AnimeDataStore {
	let reader = new DocumentReader(textEditor.document);

	let animeStorage = new AnimeDataStore();

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

function insertNextEpisode(textEditor: TextEditor, edit: TextEditorEdit): void {
	if (!extensionContext) return;

	let animeStorage = extensionContext.workspaceState.get<AnimeDataStore>("marucs-anime:storage");

	if (!isEditingSimpleCursor(textEditor)) return;

	let animeContext = findContext(textEditor, textEditor.selection.start.line);

	let anime = animeStorage?.getAnime(animeContext.currAnimeName);

	let nextEpStr = ((anime?.lastEp ?? 0) + 1).toString();
	if (nextEpStr.length < 2) nextEpStr = "0" + nextEpStr;
	edit.insert(textEditor.selection.start, nextEpStr);
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	extensionContext = context;

	if (vscode.window.activeTextEditor) {
		console.log("Reading document lines...");
		let animeStorage = readFileIntoAnimeData(vscode.window.activeTextEditor);
		console.log("All document lines read!");

		console.log(animeStorage);
		context.workspaceState.update("marucs-anime:storage", animeStorage);
	}



	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('marucs-anime.insertDate', insertDate),
		vscode.commands.registerTextEditorCommand('marucs-anime.insertTime', insertTime),
		vscode.commands.registerTextEditorCommand('marucs-anime.insertNextEpisode', insertNextEpisode),

	);

	let animelistFilter: DocumentFilter = {
		language: "anime-list",
	};


	let hoverProvider = {
		provideHover(document: TextDocument, position: Position, token: CancellationToken) {
			if (!vscode.window.activeTextEditor) return;

			let animeStorage = context.workspaceState.get<AnimeDataStore>("marucs-anime:storage");
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

			let animeStorage = context.workspaceState.get<AnimeDataStore>("marucs-anime:storage");
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
