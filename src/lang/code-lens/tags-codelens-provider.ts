import {
  CancellationToken,
  CodeLens,
  CodeLensProvider,
  ExtensionContext,
  languages,
  Range,
  TextDocument,
  window as vscodeWindow,
} from "vscode";
import { LANGUAGE_ID } from "../../constants";
import { MarucsAnime } from "../../extension";
import LineContextFinder from "../../list-parser/line-context-finder";
import { checkTags } from "../../analysis/check-tags";
import { isOk } from "rustic";

export default class TagsLensProvider implements CodeLensProvider {
  public static register(context: ExtensionContext) {
    const provider = new TagsLensProvider(context);
    return languages.registerCodeLensProvider(this.viewType, provider);
  }

  private static readonly viewType = LANGUAGE_ID;

  constructor(private readonly context: ExtensionContext) {}

  private generateTagLens(document: TextDocument, line: number, lazy = false) {
    const lineContext = LineContextFinder.findContext(document, line);

    const lineMessages: string[] = [];
    const targetLine = isOk(lineContext)
      ? lineContext.data.currentShowLine.line.lineNumber
      : line;
    const range = new Range(targetLine, 0, targetLine + 1, 10);

    if (lazy) {
      return new CodeLens(range);
    }

    if (!isOk(lineContext)) {
      lineMessages.push(`${lineContext.data}`);
    } else {
      const currShowTitle = lineContext.data.currentShowLine.params.showTitle;
      const show = MarucsAnime.INSTANCE.showStorage.searchShow(currShowTitle);
      if (!show) {
        lineMessages.push(`Show '${currShowTitle}' not found in database`);
      } else {
        const originalShowContext = LineContextFinder.findContext(
          document,
          show.info.firstMentionedLine,
        );
        if (!isOk(originalShowContext)) {
          lineMessages.push(
            `Original '${currShowTitle}' context is invalid...`,
          );
        } else {
          const currTags = lineContext.data.currentTagsLines.map(
            (lineInfo) => lineInfo.params.tag,
          );
          const { extraTags, missingTags } = checkTags(
            document,
            currTags,
            show,
          );
          if (extraTags.length > 0) {
            lineMessages.push(
              `Extra tags: ${extraTags.map((tag) => tag.name).join(", ")}`,
            );
          }
          if (missingTags.length > 0) {
            lineMessages.push(
              `Missing tags: ${missingTags.map((tag) => tag.name).join(", ")}`,
            );
          }
        }
      }
    }

    const title =
      lineMessages.length > 0 ? `${lineMessages.join(", ")}` : undefined;
    if (!title) {
      return undefined;
    }

    return new CodeLens(range, {
      title,
      command: "",
    });
  }

  async provideCodeLenses(
    document: TextDocument,
    _token: CancellationToken,
  ): Promise<CodeLens[]> {
    // console.log("provideCodeLenses");

    if (document !== vscodeWindow.activeTextEditor?.document) {
      console.warn("provideCodeLenses had weird document");
      return [];
    }

    const lenses: CodeLens[] = [];

    for (let i = document.lineCount - 1; i > 0; i--) {
      const line = document.lineAt(i);
      if (!line.text.endsWith(":")) {
        continue; // Only check lines with a colon (show title lines)
      }

      const lens = this.generateTagLens(document, i, true);
      if (lens) {
        lenses.push(lens);
      }

      if (lenses.length > 1750) {
        break; // Only check the last 10 lines (for now) //TODO: use resolveCodeLens
      }
    }

    // console.log(`Found ${lenses.length} tag lenses`);
    return lenses;
  }

  public async resolveCodeLens?(codeLens: CodeLens, _token: CancellationToken) {
    console.log("resolveCodeLens");
    const line = codeLens.range.start.line;
    const document = vscodeWindow.activeTextEditor?.document;
    if (!document) {
      console.warn("resolveCodeLens had weird document");
      return codeLens;
    }

    const newLens = this.generateTagLens(document, line);
    return (
      newLens ?? {
        ...codeLens,
        command: {
          title: "",
          command: "",
        },
      }
    );
  }
}
