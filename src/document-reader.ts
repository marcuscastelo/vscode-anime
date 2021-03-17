/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */
import * as vscode from 'vscode';

export default class DocumentReader {
	document: vscode.TextDocument;
	currentLineIdx: number;
	constructor(document: vscode.TextDocument) {
		this.document = document;
		this.currentLineIdx = 0;
	}

	getline(advance = true): (vscode.TextLine | null) {
		if (this.currentLineIdx >= this.document.lineCount) 
            return null;


		let text = this.document.lineAt(this.currentLineIdx);

		if (advance) 
            this.skiplines(1);

		return text;
	}

	skiplines(count: number) {
		this.currentLineIdx = Math.min(this.currentLineIdx + count, this.document.lineCount);
	}

	gotoLine(line: number) {
		this.currentLineIdx = line;
	}

}