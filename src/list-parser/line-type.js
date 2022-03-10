"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LineType = exports.TAG_PARAM_REG = exports.TAG_REG = exports.WATCH_REG = exports.DATE_REG = exports.SHOW_TITLE_REG = exports.COMMENT_TOKEN = void 0;
const makeGlobalReg = (regex) => new GlobalRegex(regex);
class GlobalRegex {
    constructor(regex_pattern) {
        this.regex_pattern = regex_pattern;
    }
    exec(string) { return new RegExp(this.regex_pattern).exec(string); }
}
exports.COMMENT_TOKEN = '//';
exports.SHOW_TITLE_REG = makeGlobalReg(/^\s*([a-zA-Z0-9][^{[}\]]*)\:\s*$/g);
exports.DATE_REG = makeGlobalReg(/^(\d{2}\/\d{2}\/\d{4})\s*$/g);
exports.WATCH_REG = makeGlobalReg(/^([0-9]{2}:[0-9]{2})\s*-\s*([0-9]{2}:[0-9]{2})?\s+([0-9][0-9.]{1,}|--)?\s*(?:\{(.*)\})?\s*$/);
exports.TAG_REG = makeGlobalReg(/^(?<!\[)\[([^=[\]0-9]+?)(?:\(([^)]+)\))?\](?!\])$/);
exports.TAG_PARAM_REG = makeGlobalReg(/^([^=,0-9]+)=([^),]+)$/);
var LineType;
(function (LineType) {
    LineType[LineType["ShowTitle"] = 1] = "ShowTitle";
    LineType[LineType["Date"] = 2] = "Date";
    LineType[LineType["WatchEntry"] = 3] = "WatchEntry";
    LineType[LineType["Tag"] = 4] = "Tag";
    LineType[LineType["Invalid"] = 5] = "Invalid";
    LineType[LineType["Ignored"] = 6] = "Ignored";
})(LineType = exports.LineType || (exports.LineType = {}));
//# sourceMappingURL=line-type.js.map