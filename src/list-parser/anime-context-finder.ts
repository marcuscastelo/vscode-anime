/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */
import { read } from "node:fs";
import { Selection, TextEditor, TextLine } from "vscode";
import { getLineInfo } from "./anime-contextful-parser";
import DocumentReader from "../utils/document-reader";
import { AnimeContext, LineType, Tag } from "../types";

export default function findContext(textEditor: TextEditor, lineNumber: number): AnimeContext {
    let reader = new DocumentReader(textEditor.document);
    reader.gotoLine(lineNumber);
    
    reader.skiplines(+1);
    let currentLine: TextLine | null = null;
    
    let currAnimeName = "";
    let currDate = "";
    //TODO: find tag (remember tags are valid in short scopes)
    let currTags: Tag[] = [];

    let remainingFields = 0b11;

    let lineType: LineType, params: { [key: string]: string };
    do  {
        reader.skiplines(-1);
        currentLine = reader.getline(false);

        if (!currentLine) 
            throw new Error("Unexpected state: currentLine out of text document");
        [lineType, params] = getLineInfo(currentLine);  

        if (lineType === LineType.AnimeTitle && (remainingFields & 0b01) !== 0) {
            currAnimeName = params["1"];
            remainingFields &= ~0b01;
        } else if (lineType === LineType.Date && (remainingFields & 0b10) !== 0) {
            currDate = params["1"];
            remainingFields &= ~0b10;
        }

    } while(remainingFields !== 0b0);
    
    let context: AnimeContext = {
        currAnimeName,
        currDate,
        currTags,
    };

    return context;
}