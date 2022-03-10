"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertDate = void 0;
const editor_utils_1 = require("../utils/editor-utils");
const insertDate = (textEditor, edit) => {
    if (!(0, editor_utils_1.isEditingSimpleCursor)(textEditor))
        return;
    let currDate = (new Date(Date.now())).toLocaleDateString('pt-BR');
    edit.insert(textEditor.selection.active, currDate);
};
exports.insertDate = insertDate;
//# sourceMappingURL=insert-date.js.map