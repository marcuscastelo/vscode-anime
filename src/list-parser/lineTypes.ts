import { TextLine } from "vscode";

export const COMMENT_TOKEN_SPLITTER = '//';
export const SHOW_TITLE_REG = /^\s*([a-zA-Z].*)\:\s*$/g;
export const DATE_REG = /^(\d{2}\/\d{2}\/\d{4})\s*$/g;
export const WATCH_REG = /^([0-9]{2}:[0-9]{2})\s*-\s*([0-9]{2}:[0-9]{2})?\s+([0-9][0-9.]{1,})?\s*(?:\{(.*)\})?\s*$/;
export const TAG_REG = /^\s*\[(.+)\]\s*$/;

export enum LineType {
	AnimeTitle = 1,
	Date,
	Watch,
	Tag,
	Invalid,
	Ignored,
}
