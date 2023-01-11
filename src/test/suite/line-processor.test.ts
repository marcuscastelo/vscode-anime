import * as assert from 'assert';
import ShowStorage from '../../cache/anime/show-storage';
import MADiagnosticController from '../../lang/maDiagnosticCollection';
import LineProcessor from '../../list-parser/line-processor';
import LineContext from '../../list-parser/line-context';
import DocumentReader from '../../utils/document-reader';
import { DocumentMaker } from '../helpers/text-document';
import * as SampleDocuments from '../mocks/sample-documents';
import { EpisodeSpecification, EpisodeSpecificationKind } from '../../core/episode-specification';
import { EpisodeRange } from '../../core/episode-range';

class LineProcessorTest {
    private processor: LineProcessor;
    private storage: ShowStorage;

    public static get test() { return new LineProcessorTest(); }
    private constructor() {
        this.storage = new ShowStorage();
        let dummyDiagnosticController = {} as MADiagnosticController;

        this.processor = new LineProcessor(() => this.storage, dummyDiagnosticController);
    }

    public simpleTest() {
        const sample = SampleDocuments.minimalDateTitleWatchEntryWithFriends;
        this.processor.processDocument(sample.document);

        suite("Date + Anime + 2 Episodes + Friends", () => {
            let show = this.storage.searchShow(sample.expectations.currentShowTitle);
            let processorContext = ((this.processor as any).lineContext as LineContext);

            //TODO: check if context is right after reading all lines
            test('Show exists in storage', () => assert.notEqual(show, undefined));
            test('Stored show correctly in storage', () => assert.strictEqual(show?.info.title, sample.expectations.currentShowTitle));
            // test('Correct date', () => assert.strictEqual(processorContext.currDate, date));
        });

    }

    public multiEpisodeTest() {
        const document = DocumentMaker.makeFromLines([
            '10/01/2023',
            'Test:',
            '23:58 - 23:59 [01 -> 02]',
        ]);

        this.processor.processDocument(document);

        suite("Multi-Episode Test", () => {
            let show = this.storage.searchShow('Test');
            let processorContext = ((this.processor as any).lineContext as LineContext);

            const lastEpidodeSpec = processorContext.lastWatchEntryLine!.params.episodeSpec;
            
            test('Last spec is a range', () => assert.strictEqual(lastEpidodeSpec.kind, EpisodeSpecificationKind.EpisodeRange));
            const { start, end } = EpisodeRange.fromSpec(lastEpidodeSpec)!;
            test('Start is 1', () => assert.strictEqual(start, 1));
            test('End is 2', () => assert.strictEqual(end, 2));
        });

    }
}

suite("LineProcessor Test Suite", () => {
    LineProcessorTest.test.simpleTest();
});