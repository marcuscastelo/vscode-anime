// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { ExtensionContext } from 'vscode';
import { TAG_REGISTRY_ID } from './constants';
import { MarucsAnime } from './extension';

export function activate(context: ExtensionContext) {
	context.workspaceState.update(TAG_REGISTRY_ID, undefined); //TODO: stop doing this and fix the bug

	console.log("Activating...");
	MarucsAnime.INSTANCE.activate(context);
	console.log("Activated!");
}

export function deactivate() {
	console.log("Deactivating!");
}