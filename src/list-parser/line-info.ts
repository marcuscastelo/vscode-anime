import { TextLine } from "vscode";
import { Tag, WatchEntry } from "../types";
import { LineType } from "./line-type";

export type LineInfoBase = {
    line: TextLine,
    type: LineType,
};

export type LineInfo<T = unknown> = {
    line: TextLine,
    type: T extends never ? LineType : T,
    params: LineParams<T>,
};

export type LineParams<T> =
    T extends LineType.ShowTitle ? { showTitle: string } :
    T extends LineType.Date ? { date: string } :
    T extends LineType.WatchEntry ? Pick<WatchEntry, "startTime" | "endTime" | "episode" | "company"> :
    T extends LineType.Tag ? { tag: Tag, tagName: string, tagParams: TagParam[] } :
    T extends LineType.Ignored ? {} :
    T extends LineType.Invalid ? { errors: string[] } :
    never;

export type TagParam = {
    name: string,
    value: string,
};

export type ShowTitleLineInfo = LineInfo<LineType.ShowTitle>;
export type WatchEntryLineInfo = LineInfo<LineType.WatchEntry>;
export type DateLineInfo = LineInfo<LineType.Date>;
export type TagLineInfo = LineInfo<LineType.Tag>;
