import { deprecate } from 'util';
import * as vscode from 'vscode';
import { LineType } from '../list-parser/line-type';

export interface LineMatcher<T> {
	testLine(line: vscode.TextLine): { success: true, data: T, stop: boolean } | { success: false, stop: boolean };
}

type SearchResult<T> =
	| { success: true, results: T[] }
	| { success: false, error: Error };


export default class DocumentReader implements IterableIterator<vscode.TextLine> {
	private _currentLineIndex: number = 0;
	constructor(public readonly document: vscode.TextDocument) { }

	get currentLineIndex() { return this._currentLineIndex; }
	get lineCount() { return this.document.lineCount; }

	get currentLine(): vscode.TextLine {
		return this.document.lineAt(this._currentLineIndex);
	}

	public skipLines(count: number) {
		this.goToLine(this._currentLineIndex + count);
	}

	public goToLine(lineNumber: number) {
		const clampedLine = Math.max(0, Math.min(lineNumber, this.document.lineCount));
		this._currentLineIndex = clampedLine;
	}

	searchLine<T>(step: number, matcher: LineMatcher<T>): SearchResult<T> {
		let results = [];
		for (let lineIdx = this._currentLineIndex; lineIdx >= 0; lineIdx += step) {
			const line = this.document.lineAt(lineIdx);

			const testResult = matcher.testLine(line);
			if (testResult.success) {
				results.push(testResult.data);
			}
			if (testResult.stop) {
				break;
			}
		}

		if (results.length > 0) {
			return {
				success: true,
				results: results.reverse(),
			};
		}

		return {
			success: false,
			error: new Error('No line found!'),
		};

	}

	public next(): { done: boolean, value: vscode.TextLine } {
		let done = this._currentLineIndex >= this.document.lineCount;
		if (done) {
			return { done, value: <vscode.TextLine><unknown>undefined };
		}
		else {
			let result = {
				done,
				value: this.currentLine,
			};
			this.skipLines(1);
			return result;
		}
	}

	[Symbol.iterator]() {
		return this;
	}

}