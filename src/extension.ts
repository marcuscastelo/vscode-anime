/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { assert, group } from 'node:console';
import * as vscode from 'vscode';

type Anime = {
	name: string,
	lastEp: number,
	lastLine: number,
};

let animeDict: {
	[name: string]: Anime
} = {};

enum LineType {
	AnimeTitle = 1,
	Date,
	Watch,
	Tag,
	Invalid,
	Ignored,
}

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

class DocumentReader {
	document: vscode.TextDocument;
	currentLine: number;
	constructor(document: vscode.TextDocument) {
		this.document = document;
		this.currentLine = 0;
	}

	getline(advance = true): (string | null) {
		if (this.currentLine >= this.document.lineCount) return null;


		let text = this.document.lineAt(this.currentLine).text;

		if (advance) this.skiplines(1);

		return text;
	}

	skiplines(count: number) {
		this.currentLine = Math.min(this.currentLine + count, this.document.lineCount);
	}

}

function readAnimes(textEditor: vscode.TextEditor) {
	let reader = new DocumentReader(textEditor.document);

	let currentLine: string | null = reader.getline();
	while (currentLine !== null) {
		console.log(currentLine);

		let [type, params] = getLineInfo(currentLine);

		if (type === LineType.AnimeTitle) {
			console.log(params);
		}
		currentLine = reader.getline();
	}
}

function getLineInfo(line: string): [LineType, {}] {
	const animeTitleReg = new RegExp(/([a-zA-Z].*)\:/g);
	const dateReg = new RegExp(/(\d{2}\/\d{2}\/\d{4})/g);
	const watchReg = new RegExp(/(\d{2}:\d{2}\s*\-\s*\d{2})\s+(\d{2,})/);
	const tagReg = new RegExp(/[(.+)]/);


	let groups: { [key: string]: any };
	groups = animeTitleReg.exec(line)?.groups ?? {};
	if (groups) return [LineType.AnimeTitle, groups];

	groups = dateReg.exec(line)?.groups ?? {};
	if (groups) return [LineType.Date, groups];

	groups = watchReg.exec(line)?.groups ?? {};
	if (groups) return [LineType.Watch, groups];

	groups = tagReg.exec(line)?.groups ?? {};
	if (groups) return [LineType.Tag, groups];

	return [LineType.Ignored, {}];

}

function processTag(tag: string, reader: DocumentReader) {
	let [tagType, parameters] = tag.indexOf(`=`) === -1 ? [tag, []] : tag.split(`=`);
	tagType = tagType.toLocaleLowerCase();

	if (tagType === `skip-lines`) {
		let skipCount = parseInt(parameters[0]);
		reader.skiplines(skipCount);
	}
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	if (vscode.window.activeTextEditor)
		readAnimes(vscode.window.activeTextEditor);

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('marucs-anime.insertDate', insertDate),
		vscode.commands.registerTextEditorCommand('marucs-anime.insertTime', insertTime),
	);

}


// this method is called when your extension is deactivated
export function deactivate() { }
