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

enum TagApplyInfo {
	WATCH_LINE, // such as [EPISODE-ORDER-VIOLATION]
	WATCH_SESSION, // such as [REWATCH]
	SCRIPT_TAG, //such as [SKIP-LINES=100]
}

type Tag = {
	tagType: string
	appliesTo: TagApplyInfo
	parameters: string[]
}


type EnvironmentVars = {
	currDate?: string,
	currAnimeTitle?: string,
	currTag?: Tag
};

let currentEnv : EnvironmentVars = {};

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
	currentLineIdx: number;
	constructor(document: vscode.TextDocument) {
		this.document = document;
		this.currentLineIdx = 0;
	}

	getline(advance = true): (string | null) {
		if (this.currentLineIdx >= this.document.lineCount) return null;


		let text = this.document.lineAt(this.currentLineIdx).text;

		if (advance) this.skiplines(1);

		return text;
	}

	skiplines(count: number) {
		this.currentLineIdx = Math.min(this.currentLineIdx + count, this.document.lineCount);
	}

}

function readAnimes(textEditor: vscode.TextEditor) {
	let reader = new DocumentReader(textEditor.document);
	
	let currentLine: string | null = reader.getline();
	while (currentLine !== null) {
		if (reader.currentLineIdx % (reader.document.lineCount/10) ) {
			console.log(`${reader.currentLineIdx}/${reader.document.lineCount} lines read (${(reader.currentLineIdx/reader.document.lineCount * 100).toFixed(2)}%)`)
		}
		console.log("");
		let [type, params] = getLineInfo(currentLine);

		if (type === LineType.AnimeTitle) {
			if (params["0"] === undefined) continue;
			let animeName: string = params[0];

			let currentAnime = animeDict[animeName];
			if (!currentAnime) { //If anime never registered
				currentAnime = {
					name: animeName,
					lastEp: 0, //Never watched any episode
					lastLine: -1
				};
				animeDict[animeName] = currentAnime;
			}
			currentAnime.lastLine = reader.currentLineIdx - 1;
			currentEnv.currAnimeTitle = animeName;
		}
		currentLine = reader.getline();
	}
}

function getLineInfo(line: string): [LineType, { [key: string]: string}] {
	const animeTitleReg = /(^[a-zA-Z](.)*)\:/g;
	const dateReg = /(\d{2}\/\d{2}\/\d{4})/g;
	const watchReg = /(\d{2}:\d{2}\s*\-\s*\d{2})\s+(\d{2,})/;
	const tagReg = /[(.+)]/;


	let groups: { [key: string]: any } | null;

	groups = line.match(animeTitleReg)
	if (groups) return [LineType.AnimeTitle, groups];

	groups = line.match(dateReg);
	if (groups) return [LineType.Date, groups];

	groups = line.match(watchReg);
	if (groups) return [LineType.Watch, groups];

	groups = line.match(tagReg);
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

	if (vscode.window.activeTextEditor) {
		console.log("Reading document lines...");
		readAnimes(vscode.window.activeTextEditor);
		console.log("All document lines read!");

		for(let anime of Object.keys(animeDict)){
			console.log(animeDict[anime])
		}
	}

	context.subscriptions.push(
		vscode.commands.registerTextEditorCommand('marucs-anime.insertDate', insertDate),
		vscode.commands.registerTextEditorCommand('marucs-anime.insertTime', insertTime),
	);

}


// this method is called when your extension is deactivated
export function deactivate() { }
