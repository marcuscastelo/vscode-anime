/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import DocumentReader from './document-reader';
import AnimeContextfulParser from './anime-contextful-parser';

import { Anime, Tag } from './types';
import AnimeDataStore from './anime-data-store';


function insertDate(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit): void {
	if (textEditor.selections.length !== 1) return;

	let currDate = (new Date(Date.now())).toLocaleDateString();

	edit.insert(textEditor.selection.active, currDate);
}

function insertTime(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit): void {
	if (textEditor.selections.length !== 1) return;

	let currTime = (new Date(Date.now())).toLocaleTimeString(undefined, {
		hour: `2-digit`,
		minute: `2-digit`
	});

	edit.insert(textEditor.selection.active, currTime);
}



function readFileIntoAnimeData(textEditor: vscode.TextEditor): AnimeDataStore {
	let reader = new DocumentReader(textEditor.document);

	let animeStorage = new AnimeDataStore();

	let contextParser = new AnimeContextfulParser(animeStorage);

	let currentLine: vscode.TextLine | null = reader.getline();
	while (currentLine !== null) {

		if (reader.currentLineIdx % (reader.document.lineCount/10) ) {
			console.log(`${reader.currentLineIdx}/${reader.document.lineCount} lines read (${(reader.currentLineIdx/reader.document.lineCount * 100).toFixed(2)}%)`);
		}

		contextParser.processLine(currentLine);
		currentLine = reader.getline();
	}

	return animeStorage;
}


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	if (vscode.window.activeTextEditor) {
		console.log("Reading document lines...");
		let animeStorage = readFileIntoAnimeData(vscode.window.activeTextEditor);
		console.log("All document lines read!");

		console.log(animeStorage.getAnime("Lucifer IV"));
	}

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('marucs-anime.insertDate', insertDate),
		vscode.commands.registerTextEditorCommand('marucs-anime.insertTime', insertTime),
	);

}


// this method is called when your extension is deactivated
export function deactivate() { }
