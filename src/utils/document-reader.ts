import * as vscode from 'vscode';


class LineIterator implements IterableIterator<vscode.TextLine> {
	constructor(private readonly reader: DocumentReader,
		private readonly skipCount: number) { }

	public next() {
		let indexBeforeAdvance = this.reader.currentLineIndex;
		let line = this.reader.currentLine;

		this.reader.skip(this.skipCount);

		//Checks if end of file (skip didn't increment)
		if (indexBeforeAdvance === this.reader.currentLineIndex) {
			return {
				done: true,
				value: this.reader.currentLine
			};
		}

		return {
			done: false,
			value: this.reader.currentLine
		};
	}

	[Symbol.iterator]() {
		return this;
	}

}

export default class DocumentReader {
	private _currentLineIndex: number = 0;
	constructor(private document: vscode.TextDocument) { }

	get currentLineIndex() { return this._currentLineIndex; }
	get lineCount() { return this.document.lineCount; }

	get currentLine(): vscode.TextLine {
		return this.document.lineAt(this._currentLineIndex);;
	}

	getIterator(skipCount = 1) { return new LineIterator(this, skipCount); }

	public skip(count: number) {
		this.jumpTo(this._currentLineIndex + count);
	}

	public jumpTo(line: number) {
		this._currentLineIndex = this.clampLineNumber(line);
	}

	private clampLineNumber(line: number): number {
		return Math.max(0, Math.min(line, this.document.lineCount - 1));
	}

	searchLine(skipCount: number, lineMatchFn: (line: vscode.TextLine, document: vscode.TextDocument) => boolean) {
		for (let line of this.getIterator(skipCount)) {
			if (lineMatchFn(line, this.document) === true) {
				return {
					found: true,
					line,
				};
			}
		}

		return {
			found: false,
		};
	}

}