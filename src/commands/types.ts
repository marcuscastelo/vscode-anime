import { TextEditor, TextEditorEdit } from "vscode";

export type TextEditorCommand<T> = (textEditor: TextEditor, edit: TextEditorEdit, args: T) => void;