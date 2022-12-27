const makeGlobalReg = (regex: RegExp) => new GlobalRegex(regex);

class GlobalRegex {
	constructor(private readonly regex_pattern: RegExp) { }
	public exec(string: string) { return new RegExp(this.regex_pattern).exec(string); }
}
	
export const COMMENT_TOKEN = '//';
export const SHOW_TITLE_REG = makeGlobalReg(/^\s*([a-zA-Z0-9][^{[}\]]*)\:\s*$/g);
export const DATE_REG = makeGlobalReg(/^(\d{2}\/\d{2}\/\d{4})\s*$/g);
export const WATCH_REG = makeGlobalReg(/^([0-9]{2}:[0-9]{2})\s*-\s*([0-9]{2}:[0-9]{2})?\s+([0-9][0-9.]{1,}|--)?\s*(?:\{(.*)\})?\s*$/);
export const TAG_REG = makeGlobalReg(/^\s*(?<!\[)\[([^=[\]0-9]+?)(?:\(([^)]+)\))?\](?!\])\s*(?:\/\/.*)?$/);
export const TAG_PARAM_REG = makeGlobalReg(/^([^=,0-9]+)=([^),]+)$/);

export enum LineType {
	ShowTitle = 1,
	Date,
	WatchEntry,
	Tag,
	Invalid,
	Ignored,
}
