import { TextDocument, TextLine } from "vscode";
import { Tag, Tags, TagTarget, WatchEntry } from "../types";
import DocumentReader, { LineMatcher } from "../utils/document-reader";
import LineContext from "./line-context";
import LineIdentifier, { DateLineInfo, LineInfo, ShowTitleLineInfo, TagLineInfo, WatchEntryLineInfo } from "./line-info-parser";
import { COMMENT_TOKEN, DATE_REG, LineType, SHOW_TITLE_REG, TAG_REG, WATCH_REG } from "./line-type";
import { FixedLengthArray, PredefinedArray } from '../utils/typescript-utils';

type GetContextResult =
    | { valid: true, context: LineContext }
    | { valid: false, error: Error };

type ShowTitleSearchResult = { found: true, showTitle: string } | { found: false };
type DateSearchResult = { found: true, date: string } | { found: false };
type WatchEntrySearchResult = { found: true, watchEntryLineInfo: WatchEntryLineInfo } | { found: false };
type TagSearchResult = { found: true, tags: Tag[] } | { found: false, tags: PredefinedArray<never[]> };

export default class LineContextFinder {

    private static findLastShowTitle(reader: DocumentReader): ShowTitleSearchResult {
        const showTitleMatcher: LineMatcher<ShowTitleLineInfo> = {
            testLine: (line: TextLine) => {
                const lineInfo = LineIdentifier.identifyLine(line);
                if (lineInfo.type === LineType.ShowTitle) {
                    return { hasData: true, data: lineInfo, stop: true };
                } else {
                    return { hasData: false, stop: false };
                }
            }
        };

        let showTitleRes = reader.searchLine(-1, showTitleMatcher);
        if (showTitleRes.success) {
            const showTitleLine = showTitleRes.results[0].line.text;
            const showTitle = showTitleLine.trim().replace(/:$/g, ""); //Removes trailing colon
            return { found: true, showTitle };
        } else {
            return { found: false };
        }
    }

    private static findLastDate(reader: DocumentReader): DateSearchResult {
        const dateMatcher: LineMatcher<DateLineInfo> = {
            testLine: (line: TextLine) => {
                const lineInfo = LineIdentifier.identifyLine(line);
                if (lineInfo.type === LineType.Date) {
                    return { hasData: true, data: lineInfo, stop: true };
                } else {
                    return { hasData: false, stop: false };
                }
            }
        };

        let dateRes = reader.searchLine(-1, dateMatcher);
        if (dateRes.success) {

            return { found: true, date: dateRes.results[0].params.date };
        } else {
            return { found: false };
        }
    }

    private static findLastWatchEntry(reader: DocumentReader, ofShowTitle: string): WatchEntrySearchResult {
        const watchEntryMatcher: LineMatcher<WatchEntryLineInfo> = {
            testLine: (line: TextLine) => {
                const lineInfo = LineIdentifier.identifyLine(line);
                if (lineInfo.type === LineType.WatchEntry) {
                    let copyReader = new DocumentReader(reader.document);
                    copyReader.goToLine(line.lineNumber);
                    const showTitleSearchRes = this.findLastShowTitle(copyReader);

                    if (showTitleSearchRes.found && showTitleSearchRes.showTitle === ofShowTitle) {
                        return { hasData: true, data: lineInfo, stop: true };
                    } else {
                        return { hasData: false, stop: true }; // If no show title found, this watch entry is invalid, or if not desired show title, don't include it
                    }
                } else {
                    return { hasData: false, stop: false };
                }

            }
        };

        let watchEntryRes = reader.searchLine(-1, watchEntryMatcher);
        if (watchEntryRes.success) {
            return { found: true, watchEntryLineInfo: watchEntryRes.results[0] };
        } else {
            return { found: false };
        }
    }

    private static findTags(reader: DocumentReader, ofShowTitle: string): TagSearchResult {
        let stage : 'first_line' | 'below_show' | 'above_show' | 'wrong_show';
        stage = 'first_line';

        const tagMatcher: LineMatcher<TagLineInfo> = {
            testLine: (line: TextLine, getLine) => {
                const lineInfo = LineIdentifier.identifyLine(line);

                if (lineInfo.type === LineType.Ignored || lineInfo.type === LineType.Invalid) {
                    return { hasData: false, stop: false };
                }

                // Since line is not ignored/invalid, we will process it, 
                // so it will not be first line in the next iteration
                const firstLine = stage === 'first_line';
                if (firstLine) {
                    stage = 'below_show';
                }

                if (lineInfo.type === LineType.ShowTitle) {
                    const showTitle = lineInfo.params.showTitle;
                    if (showTitle === ofShowTitle) {
                        stage = 'above_show';
                        return { hasData: false, stop: false };
                    } else {
                        stage = 'wrong_show';
                        return { hasData: false, stop: true };
                    }
                }
                
                if (lineInfo.type === LineType.Tag) {
                    const tagName = lineInfo.params.tagName; //TODO: tagParams
                    const tag = Tags[lineInfo.params.tagName];
                    if (tag.target === TagTarget.WATCH_LINE) {
                        if (firstLine) {
                            return { hasData: true, data: lineInfo, stop: false };
                        } else {
                            return { hasData: false, stop: false };
                        }
                    } else if (tag.target === TagTarget.WATCH_SESSION) {
                        if (stage === 'below_show') {
                            return { hasData: true, data: lineInfo, stop: false };
                        } else {
                            return { hasData: false, stop: false };
                        }
                    } else if (tag.target === TagTarget.SHOW) {
                        if (stage !== 'wrong_show') {
                            return { hasData: true, data: lineInfo, stop: false };
                        } else {
                            console.error('Invalid state!! (trying to read tags above wrong_show)');
                            return { hasData: false, stop: true };
                        }
                    }
                }

                return { hasData: false, stop: false };
            }
        };  

        console.debug('Searching for Tags...');
        let tagRes = reader.searchLine(-1, tagMatcher);
        if (tagRes.success) {
            return { found: true, tags: tagRes.results.map(lineInfo => Tags[lineInfo.params.tagName]) };
        } else {
            return { found: false, tags: [] };
        }
    }


    public static findContext(document: TextDocument, lineNumber: number): GetContextResult {
        let reader = new DocumentReader(document);
        reader.goToLine(lineNumber);

        //Finds nearest date declaration
        reader.goToLine(lineNumber);
        const lastDateRes = this.findLastDate(reader);
        if (!lastDateRes.found) {
            return { valid: false, error: new Error('No date found') };
        }

        //Finds nearest show title declaration
        reader.goToLine(lineNumber);
        const lastShowTitleRes = this.findLastShowTitle(reader);
        if (!lastShowTitleRes.found) {
            return { valid: false, error: new Error('No show title found') };
        }

        //Finds nearest watch entry declaration
        reader.goToLine(lineNumber);
        const lastWatchEntryRes = this.findLastWatchEntry(reader, lastShowTitleRes.showTitle);
        
        //Gets last used tags for last show
        reader.goToLine(lineNumber);
        const appliedTags = this.findTags(reader, lastShowTitleRes.showTitle);

        let lastShowTitle = lastShowTitleRes.showTitle;
        let lastDate = lastDateRes.date;
        let lastTags = appliedTags.tags;

        let context: LineContext = {
            currShowTitle: lastShowTitle,
            currDate: lastDate,
            currTags: lastTags,
            lastWatchEntryLine: lastWatchEntryRes.found ? lastWatchEntryRes.watchEntryLineInfo : undefined,
        };

        return {
            valid: true,
            context
        };
    }
}