"use strict";
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable curly */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tags = exports.TagApplyInfo = void 0;
var TagApplyInfo;
(function (TagApplyInfo) {
    TagApplyInfo[TagApplyInfo["WATCH_LINE"] = 1] = "WATCH_LINE";
    TagApplyInfo[TagApplyInfo["WATCH_SESSION"] = 2] = "WATCH_SESSION";
    TagApplyInfo[TagApplyInfo["SCRIPT_TAG"] = 3] = "SCRIPT_TAG";
    TagApplyInfo[TagApplyInfo["SHOW"] = 4] = "SHOW";
})(TagApplyInfo = exports.TagApplyInfo || (exports.TagApplyInfo = {}));
exports.Tags = {
    "NOT-ANIME": {
        tagType: 'NOT-ANIME',
        appliesTo: TagApplyInfo.SHOW,
        parameters: []
    },
    "NOT-IN-MAL": {
        tagType: 'NOT-IN-MAL',
        appliesTo: TagApplyInfo.SHOW,
        parameters: []
    },
    "勉強": {
        tagType: '勉強',
        appliesTo: TagApplyInfo.WATCH_SESSION,
        parameters: [],
    },
    "SCRIPT-SKIP": {
        tagType: 'SCRIPT-SKIP',
        appliesTo: TagApplyInfo.SCRIPT_TAG,
        parameters: ['count']
    },
    "REWATCH": {
        tagType: 'REWATCH',
        appliesTo: TagApplyInfo.SHOW,
        parameters: []
    },
    "UNSAFE-ORDER": {
        tagType: 'UNSAFE-ORDER',
        appliesTo: TagApplyInfo.WATCH_LINE,
        parameters: []
    },
    "MANGA": {
        tagType: 'MANGA',
        appliesTo: TagApplyInfo.SHOW,
        parameters: []
    },
};
//# sourceMappingURL=types.js.map