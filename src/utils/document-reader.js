"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class LineIterator {
    constructor(reader, skipCount) {
        this.reader = reader;
        this.skipCount = skipCount;
    }
    next() {
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
            value: line
        };
    }
    [Symbol.iterator]() {
        return this;
    }
}
class DocumentReader {
    constructor(document) {
        this.document = document;
        this._currentLineIndex = 0;
    }
    get currentLineIndex() { return this._currentLineIndex; }
    get lineCount() { return this.document.lineCount; }
    get currentLine() {
        return this.document.lineAt(this._currentLineIndex);
        ;
    }
    getIterator(skipCount = 1) { return new LineIterator(this, skipCount); }
    skip(count) {
        this.jumpTo(this._currentLineIndex + count);
    }
    jumpTo(line) {
        this._currentLineIndex = this.clampLineNumber(line);
    }
    clampLineNumber(line) {
        return Math.max(0, Math.min(line, this.document.lineCount - 1));
    }
    searchLine(skipCount, matcher) {
        for (let line of this.getIterator(skipCount)) {
            const { success, data } = matcher.testLine(line);
            if (success === true) {
                return {
                    success: true,
                    data,
                };
            }
        }
        return {
            success: false,
            error: new Error('Line not found!'),
        };
    }
}
exports.default = DocumentReader;
//# sourceMappingURL=document-reader.js.map