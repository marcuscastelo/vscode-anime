"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEditingSimpleCursor = void 0;
function isEditingSimpleCursor(textEditor) {
    return textEditor.selections.length === 1 && textEditor.selection.isSingleLine;
}
exports.isEditingSimpleCursor = isEditingSimpleCursor;
//# sourceMappingURL=editor-utils.js.map