import {
  DiagnosticSeverity,
  Location,
  Range,
  TextDocument,
  TextLine,
} from "vscode";
import ShowStorage from "../core/show/show-storage";
import DocumentReader from "../utils/document-reader";
import MADiagnosticController from "../lang/maDiagnosticCollection";
import LineContext from "./line-context";
import { LineType } from "./line-type";
import {
  CompleteWatchEntry,
  DocumentContexted,
  PartialWatchEntry,
  WatchEntry,
} from "../types";
import { checkTags } from "../analysis/check-tags";
import LineIdentifier from "./line-identifier";
import {
  DateLineInfo,
  LineInfo,
  ShowTitleLineInfo,
  TagLineInfo,
  WatchEntryLineInfo,
} from "./line-info";
import { equip, isErr, isOk } from "rustic";
import { Tag, TagTarget } from "../core/tag";
import { MarucsAnime } from "../extension";
import { Supplier } from "../utils/typescript-utils";
import { ddmmyyyToDate } from "../utils/date-utils";
import LineContextFinder from "./line-context-finder";

type ParserListener = (lineInfo: LineInfo) => void;

export default class AnlParser {
  private lineContext: Partial<LineContext>;
  private diagnosticExtraContext: {
    mostRecentDateLine: DateLineInfo | undefined;
  };

  constructor(
    private getStorage: Supplier<ShowStorage>,
    private diagnosticController: MADiagnosticController,
  ) {
    this.lineContext = {};
    this.diagnosticExtraContext = {
      mostRecentDateLine: undefined,
    };
  }

  parseDocument(
    document: TextDocument,
    config: {
      listener?: ParserListener;
      alreadyProccessedLineCount?: number;
    } = {},
  ) {
    const reader = new DocumentReader(document);

    console.log(`[anl-parser] Processing ${document.uri}...`);

    if (config.alreadyProccessedLineCount !== undefined) {
      console.log(
        `[anl-parser] Skipping ${config.alreadyProccessedLineCount} lines, because they were already processed (cache)`,
      );
      const gotoLine = config.alreadyProccessedLineCount;

      reader.goToLine(gotoLine);
      const result = LineContextFinder.findContext(document, gotoLine);
      if (isOk(result)) {
        this.lineContext = result.data;
      } else {
        console.error(
          `[anl-parser] Error while trying to find context at line ${gotoLine}, error: ${result.data.message}`,
        );
      }
    }

    for (const currentLine of reader) {
      const lineInfo = this.parseLine(currentLine, reader);
      config.listener?.(lineInfo);
    }
    console.log(`[anl-parser] Finished processing ${document.uri}`);
  }

  private parseLine(line: TextLine, reader: DocumentReader) {
    const lineInfo = LineIdentifier.identifyLine(line);

    if (lineInfo.type === LineType.ShowTitle) {
      this.parseShowTitleLine(lineInfo, reader.document);
    } else if (lineInfo.type === LineType.WatchEntry) {
      this.parseWatchLine(lineInfo);
    } else if (lineInfo.type === LineType.Date) {
      this.parseDateLine(lineInfo);
    } else if (lineInfo.type === LineType.Tag) {
      this.parseTagLine(lineInfo, reader);
    } else if (lineInfo.type === LineType.Invalid) {
      for (const error of lineInfo.errors) {
        this.diagnosticController.addLineDiagnostic(line, error);
      }
    }

    return lineInfo;
  }

  private parseDateLine(lineInfo: DateLineInfo) {
    if (this.diagnosticExtraContext.mostRecentDateLine === undefined) {
      if (this.lineContext.currentShowLine !== undefined) {
        console.error(
          "Unexpected state: current show line is defined but most recent date line is not",
        );
      }
    }

    const newDateRes = ddmmyyyToDate(lineInfo.params.date);
    if (isErr(newDateRes)) {
      this.diagnosticController.addLineDiagnostic(
        lineInfo.line,
        `Error while processing current date at line ${lineInfo.line.lineNumber + 1}: ${lineInfo.params.date}`,
      );
    }
    const newDate = equip(newDateRes).unwrap();

    const mostRecentDateStr =
      this.diagnosticExtraContext.mostRecentDateLine?.params.date;
    if (mostRecentDateStr !== undefined) {
      const mostRecentDateRes = ddmmyyyToDate(mostRecentDateStr);
      if (isErr(mostRecentDateRes)) {
        const diagnosticLine =
          this.diagnosticExtraContext.mostRecentDateLine?.line.lineNumber;

        const diagnosticLineStr =
          diagnosticLine !== undefined ? `${diagnosticLine + 1}` : "unknown";

        this.diagnosticController.addLineDiagnostic(
          lineInfo.line,
          `Error while processing most recent date at line ${diagnosticLineStr}: ${mostRecentDateStr}`,
        );
      }

      const mostRecentDate = equip(mostRecentDateRes).unwrap();

      if (newDate.getTime() < mostRecentDate.getTime()) {
        this.diagnosticController.addLineDiagnostic(
          lineInfo.line,
          "New date is older than previous declared date",
        );
        //TODO: link to previous date line
      }

      if (newDate.getTime() === mostRecentDate.getTime()) {
        this.diagnosticController.addLineDiagnostic(
          lineInfo.line,
          "Redundant date",
        );
        //TODO: link to previous date line
      }
    }

    this.lineContext.currentDateLine = lineInfo;

    if (
      this.diagnosticExtraContext.mostRecentDateLine === undefined ||
      newDate.getTime() >
        equip(
          ddmmyyyToDate(
            this.diagnosticExtraContext.mostRecentDateLine.params.date,
          ),
        )
          .unwrap()
          .getTime()
    ) {
      this.diagnosticExtraContext.mostRecentDateLine = lineInfo;
    }

    //Resets current anime, so that it is necessary to explicitly set an anime title everytime the day changes
    this.lineContext.currentShowLine = undefined;
  }

  private parseShowTitleLine(
    lineInfo: ShowTitleLineInfo,
    document: TextDocument,
  ) {
    const showTitle = lineInfo.params.showTitle;

    if (showTitle === this.lineContext.currentShowLine?.params.showTitle) {
      this.diagnosticController.addLineDiagnostic(
        lineInfo.line,
        "Redundant show title",
      );
      return;
    }

    this.lineContext.currentTagsLines =
      this.lineContext.currentTagsLines?.filter(
        (lineInfo) =>
          lineInfo.params.tag.target !== TagTarget.SHOW &&
          lineInfo.params.tag.target !== TagTarget.WATCH_SESSION,
      );

    const storage = this.getStorage();
    const showResult = storage.getOrCreateShow(
      showTitle,
      lineInfo.line.lineNumber,
      this.lineContext.currentTagsLines?.map((lineInfo) => lineInfo.params.tag),
    );

    if (isErr(showResult)) {
      this.diagnosticController.addLineDiagnostic(
        lineInfo.line,
        `Error while processing show: ${showResult.data}`,
      );
      return;
    }

    //TODO: check for empty sessions ( i.e: no watch entries between titles )
    const currShow = showResult.data;
    currShow.info.lastMentionedLine = lineInfo.line.lineNumber;

    const currTags =
      this.lineContext.currentTagsLines?.map(
        (lineInfo) => lineInfo.params.tag,
      ) || [];
    const { missingTags, extraTags } = checkTags(document, currTags, currShow);

    const names = (tag: Tag) => tag.name;
    const toList = (accum: string, token: string) => accum + "," + token;
    const listTags = (tags: Tag[]) => tags.map(names).reduce(toList, "");

    let relatedErrorMessage = "";
    const messageBitmask =
      (missingTags.length > 0 ? 1 : 0) | (extraTags.length > 0 ? 2 : 0);
    if (messageBitmask !== 0) {
      relatedErrorMessage = "Error: ";
    }
    if (messageBitmask & 1) {
      relatedErrorMessage += `those tags are missing: [${listTags(missingTags)}]`;
    }
    if (messageBitmask & 3) {
      relatedErrorMessage += `\nand `;
    }
    if (messageBitmask & 2) {
      relatedErrorMessage += `too many tags: [${listTags(extraTags)}]`;
    }

    if (messageBitmask !== 0) {
      this.diagnosticController.addDiagnostic({
        message: `Incorrect tagging (does not align with previous definition): ${relatedErrorMessage}`,
        range: lineInfo.line.range,
        severity: DiagnosticSeverity.Error,
        relatedInformation: [
          {
            location: new Location(
              document.uri,
              document.lineAt(currShow.info.firstMentionedLine).range,
            ),
            message: "Fist show declaration is here",
          },
        ],
      });
    }

    this.lineContext.currentShowLine = lineInfo;
    this.lineContext.currentTagsLines =
      this.lineContext.currentTagsLines?.filter(
        (lineInfo) => lineInfo.params.tag.target !== TagTarget.SHOW,
      );
  }

  private parseWatchLine(lineInfo: WatchEntryLineInfo) {
    const { currentShowLine } = this.lineContext;

    if (!currentShowLine) {
      this.diagnosticController.addLineDiagnostic(
        lineInfo.line,
        "Anime title not defined (or ill-defined)",
      );
      return;
    }

    const currentShowTitle = currentShowLine.params.showTitle;
    const currentShow = this.getStorage().searchShow(
      currentShowLine.params.showTitle,
    );

    this.lineContext.currentTagsLines =
      this.lineContext.currentTagsLines?.filter(
        (lineInfo) => lineInfo.params.tag.target !== TagTarget.WATCH_LINE,
      );

    if (!currentShowTitle) {
      this.diagnosticController.addLineDiagnostic(
        lineInfo.line,
        "Watch Entry provided, but not inside a show",
      );
      return;
    }

    if (!currentShow) {
      throw new Error(
        `Unexpected error: anime '${currentShowTitle}' not found in list, despite being the current show`,
      );
    }

    const { startTime, endTime, episode, company: friends } = lineInfo.params;
    if (episode !== "--" && isNaN(parseInt(episode))) {
      this.diagnosticController.addLineDiagnostic(
        lineInfo.line,
        "Episode is nor a number nor --",
      );
      return;
    }

    const validTimeReg = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    const lineRange = lineInfo.line.range;
    const lineStart = lineRange.start;

    if (!validTimeReg.test(startTime)) {
      this.diagnosticController.addRangeDiagnostic(
        new Range(lineStart, lineStart.with({ character: 4 })),
        "WatchEntry: Invalid startTime",
      );
    }

    if (!validTimeReg.test(endTime)) {
      this.diagnosticController.addRangeDiagnostic(
        new Range(
          lineStart.with({ character: 6 }),
          lineStart.with({ character: 10 }),
        ),
        "WatchEntry: Invalid endTime",
      );
    }

    //TODO: consider currDate and 23:59 - 00:00 entries
    let watchEntry: WatchEntry;
    if (episode === "--") {
      const lastEpisode =
        currentShow.info.lastCompleteWatchEntry?.data.episode ?? 0;
      watchEntry = <PartialWatchEntry>{
        partial: true,
        showTitle: currentShowTitle,
        startTime,
        endTime,
        episode: lastEpisode + 1,
        lineNumber: lineInfo.line.lineNumber,
        company: friends,
      };
    } else {
      watchEntry = <CompleteWatchEntry>{
        partial: false,
        showTitle: currentShowTitle,
        startTime,
        endTime,
        episode: parseInt(episode),
        lineNumber: lineInfo.line.lineNumber,
        company: friends,
      };
    }

    const lastWatchedEpisode =
      currentShow.info.lastCompleteWatchEntry?.data.episode ?? 0;
    if (lastWatchedEpisode >= watchEntry.episode) {
      //TODO: related info last ep's line
      //TODO: check for skipped as well
      //TODO: check for [UNSAFE-ORDER]
      //TODO: check for REWATCH (major rewrite of the code to support this)
      function checkUnsafeOrder(currentTags: Tag[]) {
        return (
          currentTags.find((tag) => tag.name === "UNSAFE-ORDER") !== undefined
        );
      }

      const currentTags =
        this.lineContext.currentTagsLines?.map(
          (lineInfo) => lineInfo.params.tag,
        ) ?? [];

      const isUnsafeOrder = checkUnsafeOrder(currentTags);
      const isSkip = false;
      const checkOrder = !isUnsafeOrder && !isSkip;
      if (checkOrder) {
        this.diagnosticController.addLineDiagnostic(
          lineInfo.line,
          `Watch entry violates ascending episodes rule (${lastWatchedEpisode} -> ${watchEntry.episode})`,
        );
      } else {
        this.diagnosticController.addDiagnostic({
          message: `Unsafe = ${isUnsafeOrder}, skip = ${isSkip}`,
          range: lineInfo.line.range,
          severity: DiagnosticSeverity.Warning,
          // relatedInformation: [{ location: new Location(lineInfo.line.uri, lineInfo.line.range), message: "Last watched episode is here" }]
        });
      }
    }

    const watchEntryCtx: DocumentContexted<WatchEntry> = {
      data: watchEntry,
      lineNumber: lineInfo.line.lineNumber,
    };

    this.getStorage().registerWatchEntry(currentShowTitle, watchEntryCtx);

    for (const friend of friends) {
      this.getStorage().registerFriend(friend);
    }
  }

  private parseTagLine(lineInfo: TagLineInfo, reader: DocumentReader) {
    const { tagName } = lineInfo.params;

    const tag = MarucsAnime.INSTANCE.tagRegistry.get(tagName);

    if (!tag) {
      this.diagnosticController.addLineDiagnostic(
        lineInfo.line,
        "Unknown tag, ignoring!",
        { severity: DiagnosticSeverity.Warning },
      );
      return;
    }

    if (tag.target === TagTarget.SHOW) {
      this.lineContext.currentShowLine = undefined;
    }

    for (const param of tag.parameters) {
      const tp = lineInfo.params.tagParams.find((tp) => tp.name === param);
      if (!tp) {
        this.diagnosticController.addLineDiagnostic(
          lineInfo.line,
          `Missing parameters, parameter list: [${tag.parameters.reduce((a, b) => `${a}, ${b}`)}]`,
        );
        return;
      }
    }

    if (tag.name === "SCRIPT-SKIP") {
      const paramValue = lineInfo.params.tagParams.find(
        (tp) => tp.name === "count",
      )?.value;
      const skipCount = parseInt(paramValue ?? "0");

      if (isNaN(skipCount)) {
        this.diagnosticController.addLineDiagnostic(
          lineInfo.line,
          `Invalid skip count = '${paramValue}'`,
        );
        return;
      }

      reader.skipLines(skipCount);
    }

    if (tag.target !== TagTarget.SCRIPT_TAG) {
      if (
        this.lineContext.currentTagsLines
          ?.map((lineInfo) => lineInfo.params.tag)
          .indexOf(tag) === -1
      ) {
        console.log(`[anl-parser] Adding tag ${tag.name}`);
        this.lineContext.currentTagsLines
          ?.map((lineInfo) => lineInfo.params.tag)
          .push(tag);
      }
    }

    // let [tagType, parameters] = tag.indexOf(`=`) === -1 ? [tag, []] : tag.split(`=`);
    // tagType = tagType.toLocaleLowerCase();

    // if (tagType === `skip-lines`) {
    //     let skipCount = parseInt(parameters[0]);
    //     this.reader.skiplines(skipCount);
    // }
  }
}
