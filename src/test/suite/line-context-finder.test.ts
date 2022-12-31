import LineContextFinder from '../../list-parser/line-context-finder';
import * as assert from 'assert';
import * as SampleDocuments from '../mocks/sample-documents';
import { LineType } from '../../list-parser/line-type';
import { DateLineInfo, LineInfo, LineInfoBase } from '../../list-parser/line-info';
import { isErr } from 'rustic';
import { beforeEach, describe, it, suite } from 'mocha';

type LineInfoOfType<T extends LineType> = LineInfoBase & {type: T};
class LineContextFinderTest {
    public static get test() { return new LineContextFinderTest(); }


    private assertLineInfoIsValid<U extends LineType>(lineInfo: LineInfoBase | undefined, expectedType: U): lineInfo is LineInfoOfType<U> {
        if (!lineInfo) {
            assert.fail("Expected line to be defined");
        }
        
        if (lineInfo.type !== expectedType) {
            assert.fail(`Expected line to be of type ${LineType.Date}, but got ${lineInfo.type}`);
        }

        return true;
    }

    private isDateLineCorrect(expectations: SampleDocuments.DocumentTestExpectations, lineInfo?: LineInfo) {
        if(this.assertLineInfoIsValid(lineInfo, LineType.Date)) {
            assert.strictEqual(lineInfo.params.date, expectations.currentDate);
        }
    }

    private isShowTitleLineCorrect(expectations: SampleDocuments.DocumentTestExpectations, lineInfo?: LineInfo) {
        if(!this.assertLineInfoIsValid(lineInfo, LineType.ShowTitle)) {
            return;
        }

        assert.strictEqual(lineInfo.params.showTitle, expectations.currentShowTitle);
    }

    private isLastWatchEntryLineCorrect(expectations: SampleDocuments.DocumentTestExpectations, lineInfo?: LineInfo) {
        if(!this.assertLineInfoIsValid(lineInfo, LineType.WatchEntry)) {
            return;
        }

        assert.deepStrictEqual(lineInfo.params, expectations.lastWatchEntryParams);
    }

    public canFindContext() {
        const sample = SampleDocuments.minimalDateTitleWatchEntry;
        const contextRes = LineContextFinder.findContext(sample.document, sample.document.lineCount - 1);
        if (isErr(contextRes)) {
            assert.fail(contextRes.data);
        }

        const context = contextRes.data;
        suite("LineContextFinder", () => {
            test('Correct date', () => this.isDateLineCorrect(sample.expectations, context.currentDateLine));
            test('Correct show title', () => this.isShowTitleLineCorrect(sample.expectations, context.currentShowLine));
            test('Correct last watch entry', () => this.isLastWatchEntryLineCorrect(sample.expectations, context.lastWatchEntryLine));
        });
    }
}

suite("LineContextFinder Test Suite", () => {
    LineContextFinderTest.test.canFindContext();
});