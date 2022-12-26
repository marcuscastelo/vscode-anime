import LineContextFinder from '../../list-parser/line-context-finder';
import * as assert from 'assert';
import * as SampleDocuments from '../mocks/sample-documents';
import { LineType } from '../../list-parser/line-type';
import { DateLineInfo, LineInfo, LineInfoBase } from '../../list-parser/line-info';

class LineContextFinderTest {
    public static get test() { return new LineContextFinderTest(); }

    private assertLineInfoIsValid<U extends LineType>(lineInfo: LineInfo<U> | undefined, expectedType: U): lineInfo is LineInfo<U> {
        if (!lineInfo) {
            assert.fail("Expected line to be defined");
        }
        
        if (lineInfo.type !== expectedType) {
            assert.fail(`Expected line to be of type ${LineType.Date}, but got ${lineInfo.type}`);
        }

        return true;
    }

    private isDateLineCorrect(expectations: SampleDocuments.DocumentTestExpectations, lineInfo?: LineInfo) {
        if(this.assertLineInfoIsValid<LineType.Date>(lineInfo, LineType.Date)) {
            assert.strictEqual(lineInfo.params.date, expectations.currentDate);
        }

    }

    private isShowTitleLineCorrect(expectations: SampleDocuments.DocumentTestExpectations, lineInfo?: LineInfo) {
        if(!this.assertLineInfoIsValid<LineType.ShowTitle>(lineInfo, LineType.ShowTitle)) {
            return;
        }

        assert.strictEqual(lineInfo.params.date, expectations.currentDate);
    }

    private isLastWatchEntryLineCorrect(expectations: SampleDocuments.DocumentTestExpectations, lineInfo?: LineInfo) {
        if(!this.assertLineInfoIsValid<LineType.WatchEntry>(lineInfo, LineType.WatchEntry)) {
            return;
        }

        assert.strictEqual(lineInfo.params.date, expectations.currentDate);
    }

    public canFindContext() {
        const sample = SampleDocuments.minimalDateTitleWatchEntry;
        const contextRes = LineContextFinder.findContext(sample.document, sample.document.lineCount - 1);
        if (!contextRes.ok) {
            assert.fail(contextRes.error);
        }

        const context = contextRes.result;
        suite("LineContextFinder", () => {
            test('Correct date', () => this.isDateLineCorrect(sample.expectations, context.currentDateLine));
            test('Correct show title', () => assert.strictEqual(context.currentShowLine.line.text, sample.expectations.currentShowTitle));
            test('Correct last watch entry', () => assert.deepStrictEqual(context.lastWatchEntryLine?.params, sample.expectations.lastWatchEntryParams));
        });
    }
}

suite("LineContextFinder Test Suite", () => {
    LineContextFinderTest.test.canFindContext();
});