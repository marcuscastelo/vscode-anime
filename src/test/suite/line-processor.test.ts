import * as assert from "assert";
import ShowRegistry from "../../core/registry/show-registry";
import MADiagnosticController from "../../lang/maDiagnosticCollection";
import AnlParser from "../../list-parser/anl-parser";
import * as SampleDocuments from "../mocks/sample-documents";

class LineProcessorTest {
  private processor: AnlParser;
  private storage: ShowRegistry;

  public static get test() {
    return new LineProcessorTest();
  }
  private constructor() {
    this.storage = new ShowRegistry();
    const dummyDiagnosticController = {} as MADiagnosticController;

    this.processor = new AnlParser(
      () => this.storage,
      dummyDiagnosticController,
    );
  }

  public simpleTest() {
    const sample = SampleDocuments.minimalDateTitleWatchEntryWithFriends;
    this.processor.parseDocument(sample.document);

    suite("Date + Anime + 2 Episodes + Friends", () => {
      const show = this.storage.searchShow(
        sample.expectations.currentShowTitle,
      );

      //TODO: check if context is right after reading all lines
      test("Show exists in storage", () => assert.notEqual(show, undefined));
      test("Stored show correctly in storage", () =>
        assert.strictEqual(show?.title, sample.expectations.currentShowTitle));
      // test('Correct date', () => assert.strictEqual(processorContext.currDate, date));
    });
  }
}

suite("LineProcessor Test Suite", () => {
  LineProcessorTest.test.simpleTest();
});
