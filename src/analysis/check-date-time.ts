import { Err, isErr, Ok, Result } from "rustic";
import { TextDocument } from "vscode";
import LineContext from "../list-parser/line-context";
import LineContextFinder from "../list-parser/line-context-finder";

export function checkLineInDocumentIsToday(document: TextDocument, line: number): Result<boolean, Error> {
	const contextRes = LineContextFinder.findContext(document, line);
	if (isErr(contextRes)) {
		console.error(contextRes.data);
        return Err(contextRes.data);
	}

	return Ok(checkContextDateIsToday(contextRes.data));
}

export function checkContextDateIsToday(context: LineContext): boolean {
    const contextDate = context.currentDateLine.params.date;
    return checkDateIsToday(contextDate);
}

export function checkDateIsToday(date: string): boolean {
    let currDate = (new Date(Date.now())).toLocaleDateString('pt-BR');
    return currDate === currDate;
}