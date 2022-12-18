// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext } from 'vscode';
import { MarucsAnime } from './extension';

export function activate(context: ExtensionContext) {
	MarucsAnime.activate(context);
}

export function deactivate() {
	console.log("Deactivating!");
}