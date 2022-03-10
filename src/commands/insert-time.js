"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertTime = void 0;
const editor_utils_1 = require("../utils/editor-utils");
const insertTime = (textEditor, edit) => {
    if (!(0, editor_utils_1.isEditingSimpleCursor)(textEditor))
        return;
    let currTime = (new Date(Date.now())).toLocaleTimeString('pt-BR', {
        hour: `2-digit`,
        minute: `2-digit`
    });
    let currentLineText = textEditor.document.lineAt(textEditor.selection.start.line).text;
    let emptyLine = currentLineText.match(/^\s*$/g) !== null;
    let halfWay = currentLineText.match(/^\s*(\d{2}:\d{2})\s*\-?\s*$/g) !== null;
    let hasDash = currentLineText.indexOf('-');
    if (!emptyLine && !halfWay)
        return;
    if (halfWay) {
        if (!hasDash)
            currTime = ' - ' + currTime.trim();
        currTime += ' ';
    }
    else if (emptyLine)
        currTime += currentLineText.endsWith(' ') ? '- ' : ' - ';
    edit.insert(textEditor.selection.active, currTime);
};
exports.insertTime = insertTime;
//# sourceMappingURL=insert-time.js.map