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
type WatchEntrySearchResult = { found: true, watchEntry: WatchEntryLineInfo } | { found: false };
type TagSearchResult = { found: true, tags: Tag[] } | { found: false, tags: PredefinedArray<never[]> };

export default class LineContextFinder {

    private static findLastShowTitle(reader: DocumentReader): ShowTitleSearchResult {
        const showTitleMatcher: LineMatcher<ShowTitleLineInfo> = {
            testLine: (line: TextLine) => {
                const lineInfo = LineIdentifier.identifyLine(line);
                if (lineInfo.type === LineType.ShowTitle) {
                    return { success: true, data: lineInfo, stop: true };
                } else {
                    return { success: false, stop: false };
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
                    return { success: true, data: lineInfo, stop: true };
                } else {
                    return { success: false, stop: false };
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
                        return { success: true, data: lineInfo, stop: true };
                    } else {
                        return { success: false, stop: true }; // If no show title found, this watch entry is invalid, or if not desired show title, don't include it
                    }
                } else {
                    return { success: false, stop: false };
                }

            }
        };

        let watchEntryRes = reader.searchLine(-1, watchEntryMatcher);
        if (watchEntryRes.success) {
            return { found: true, watchEntry: watchEntryRes.results[0] };
        } else {
            return { found: false };
        }
    }

    private static findTags(reader: DocumentReader, ofShowTitle: string): TagSearchResult {
        // TODO: REWRITE COMPLETELY (UTTER TRASH NOW)
        let initialLineNumber = reader.currentLine.lineNumber;

        let readerCopy = new DocumentReader(reader.document);
        readerCopy.goToLine(initialLineNumber);
        const lastWatchEntrySearchRes = this.findLastWatchEntry(readerCopy, ofShowTitle);

        // All TagTarget.WATCH_LINE needs to be below the last WATCH_LINE (Watch Entry)
        const minWatchEntryTagLineNumber = lastWatchEntrySearchRes.found ? lastWatchEntrySearchRes.watchEntry.line.lineNumber + 1 : -1; 
        //TODO: fix error above: -1 if above last show title (should not influence tag search for now)

        const tagMatcher: LineMatcher<Tag> = {
            testLine: (line: TextLine) => {
                // Only match tag lines
                const lineInfo = LineIdentifier.identifyLine(line);
                if (lineInfo.type !== LineType.Tag) {
                    return { success: false, stop: false };
                }

               

                const tagName = lineInfo.params.tagName;

                // If tag is unknown, don't include it
                if (Object.keys(Tags).indexOf(tagName) === -1) {
                    return { success: false, stop: false }; // Ignore unknown tags (they are already pointed as an error)
                }
                let tag = Tags[lineInfo.params.tagName];

                // If outside last show title (WATCH_SESSION), stop search (all tags lost validity)
                let readerCopy = new DocumentReader(reader.document);
                readerCopy.goToLine(line.lineNumber);
                const searchRes = this.findLastShowTitle(readerCopy);
                if (searchRes.found && searchRes.showTitle !== ofShowTitle) {

                    if (tag.target === TagTarget.SHOW) {
                        return { success: true, data: tag, stop: false }; // Show Tags are defined before show title (so we can't stop searching)
                    }
                    
                    console.log('Stopping tag search at line ' + line.lineNumber);
                    return { success: false, stop: true }; // If outside current show, just stop searching
                }

                
                // *** Specific tag requirements *** //
                if (tag.target === TagTarget.SHOW) {
                    // console.error('This line should not be called!!!!');
                    // throw new Error('This line should not be called!!!!'); // Except when hovering the first anime's tags
                    return { success: true, data: tag, stop: false }; 
                } else if (tag.target === TagTarget.WATCH_LINE) {
                    if (line.lineNumber < minWatchEntryTagLineNumber) {
                        return { success: false, stop: false }; // If outside current show, ignore (we can't stop yet, because maybe there are SHOW tags)
                    } 

                }
                // TagTarget.WATCH_SESSION is already covered by TagTarget.SHOW
                // TagTarget.SCRIPT_TAG is not attached to any line on the list 
                
                return { success: true, data: tag, stop: false };
                // return { success: true, data: lineInfo, stop: false };
            }
        };

        let tagRes = reader.searchLine(-1, tagMatcher);
        if (tagRes.success) {
            return { found: true, tags: tagRes.results };
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
        if (!lastWatchEntryRes.found) {
            return { valid: false, error: new Error('No watch entry found') };
        }
        
        //Gets last used tags for last show
        reader.goToLine(lineNumber);
        const appliedTags = this.findTags(reader, lastShowTitleRes.showTitle);

        let lastShowTitle = lastShowTitleRes.showTitle;
        let lastDate = lastDateRes.date;
        let lastTags = appliedTags.tags;

        let context: LineContext = {
            currShowTitle: lastShowTitle,
            currDate: lastDate,
            currTags: lastTags
            // lastWatchEntry,
        };

        return {
            valid: true,
            context
        };
    }
}