import { TextLine } from "vscode";
import { Tag } from "../core/tag";
import {  WatchEntry } from "../types";
import { LineType } from "./line-type";

export type LineInfoBase = {
    line: TextLine,
    type: LineType,
};

export type LineInfo =
    LineInfoBase & (
        | { type: LineType.Date } & DateLineInfo
        | { type: LineType.ShowTitle } & ShowTitleLineInfo
        | { type: LineType.WatchEntry } & WatchEntryLineInfo
        | { type: LineType.Tag } & TagLineInfo
        | { type: LineType.Ignored }
        | { type: LineType.Invalid, errors: string[] }
    );

export type ShowTitleLineInfo =
    LineInfoBase &
    {
        type: LineType.ShowTitle,
        params: {
            showTitle: string
        }
    };

export type WatchEntryLineInfo =
    LineInfoBase &
    {
        type: LineType.WatchEntry,
        params: {
            startTime: string,
            endTime: string,
            episode: string,
            company: string[],
        }
    };

export type DateLineInfo =
    LineInfoBase &
    {
        type: LineType.Date,
        params: {
            date: string
        }
    };

export type TagParam = {
    name: string,
    value: string,
};

export type TagLineInfo =
    LineInfoBase &
    {
        type: LineType.Tag,
        params: {
            tag: Tag,
            tagName: string,
            tagParams: TagParam[],
        }
    };