import * as assert from "assert";
import ShowRegistry from "../../core/registry/show-registry";
import MADiagnosticController from "../../lang/maDiagnosticCollection";
import AnlParser from "../../list-parser/anl-parser";
import * as SampleDocuments from "../mocks/sample-documents";

class AnlParserTest {
  private parser: AnlParser;
  private showRegistry: ShowRegistry;

  public static get test() {
    return new AnlParserTest();
  }
  private constructor() {
    this.showRegistry = new ShowRegistry();
    const dummyDiagnosticController = {} as MADiagnosticController;

    this.parser = new AnlParser(
      () => this.showRegistry,
      dummyDiagnosticController,
    );
  }

  public simpleTest() {
    const sample = SampleDocuments.minimalDateTitleWatchEntryWithFriends;
    this.parser.parseDocument(sample.document);

    suite("Date + Anime + 2 Episodes + Friends", () => {
      const show = this.showRegistry.searchShow(
        sample.expectations.currentShowTitle,
      );

      //TODO: check if context is right after reading all lines
      test("Show exists in registry", () => assert.notEqual(show, undefined));
      test("Stored show correctly in registry", () =>
        assert.strictEqual(show?.title, sample.expectations.currentShowTitle));
      // test('Correct date', () => assert.strictEqual(processorContext.currDate, date));
    });
  }
}

suite("LineProcessor Test Suite", () => {
  AnlParserTest.test.simpleTest();
});
