import * as checkDateTime from '../../../analysis/check-date-time';

import { describe, it, beforeEach, afterEach, suite } from 'mocha';

import * as sinon from 'sinon';
import LineContext from '../../../list-parser/line-context';
import { TextDocumentMock } from '../../mocks/text-document-mock';
import { TextDocument, TextLine } from 'vscode';
import { equip } from 'rustic';
import { DocumentMaker } from '../../helpers/text-document';

describe('check-date-time', () => {
    const YESTERDAY = '31/12/2018';
    const TODAY = '01/01/2019';
    const TOMORROW = '02/01/2019';
    
    beforeEach(() => {
        sinon.stub(Date.prototype, 'toLocaleDateString').returns(TODAY);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('checkDateIsToday', () => {
        it('should return true if the date is today', () => {
            checkDateTime.checkDateIsToday(TODAY).should.be.true();
        });

        it('should return false if the date is tomorrow', () => {
            checkDateTime.checkDateIsToday(TOMORROW).should.be.false();
        });

        it('should return false if the date is yesterday', () => {
            checkDateTime.checkDateIsToday(YESTERDAY).should.be.false();
        });
    });

    describe('checkContextDateIsToday', () => {
        it('should return true if the date is today', () => {
            checkDateTime.checkContextDateIsToday({ currentDateLine: { params: { date: TODAY } } } as LineContext).should.be.true();
        });

        it('should return false if the date is tomorrow', () => {
            checkDateTime.checkContextDateIsToday({ currentDateLine: { params: { date: TOMORROW } } } as LineContext).should.be.false();
        });

        it('should return false if the date is yesterday', () => {
            checkDateTime.checkContextDateIsToday({ currentDateLine: { params: { date: YESTERDAY } } } as LineContext).should.be.false();
        });
    });

    describe('checkLineInDocumentIsToday', () => {

        function createDocumentWithDate(date: string): TextDocument {
            const lines = [
                date,
                'Show Title:',
                '22:00 - 23:00 01',
                '23:00 - 00:00 02',
            ];
            return DocumentMaker.makeFromLines(lines);
        }

        const LINE = 3;

        it('should return true if the date is today', () => {
            const textDocument = createDocumentWithDate(TODAY);
            const textDocumentMock = sinon.mock(textDocument);

            const result = equip(checkDateTime.checkLineInDocumentIsToday(textDocument, LINE));
            result.isOk().should.be.true(`Result should be ok, but is '${result.err().map(e => e.message).unwrapOr('Unknown error')}'`);
            result.unwrap().should.be.true();
            
            textDocumentMock.verify();
        });

        it('should return false if the date is tomorrow', () => {
            const textDocument = createDocumentWithDate(TOMORROW);
            const textDocumentMock = sinon.mock(textDocument);

            const result = equip(checkDateTime.checkLineInDocumentIsToday(textDocument, LINE));
            result.isOk().should.be.true(`Result should be ok, but is '${result.err().map(e => e.message).unwrapOr('Unknown error')}'`);
            result.unwrap().should.be.false();

            textDocumentMock.verify();
        });

        it('should return false if the date is yesterday', () => {
            const textDocument = createDocumentWithDate(YESTERDAY);
            const textDocumentMock = sinon.mock(textDocument);

            const result = equip(checkDateTime.checkLineInDocumentIsToday(textDocument, LINE));
            result.isOk().should.be.true(`Result should be ok, but is '${result.err().map(e => e.message).unwrapOr('Unknown error')}'`);
            result.unwrap().should.be.false();

            textDocumentMock.verify();
        });
    });
});