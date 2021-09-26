/* eslint-disable curly */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { glob, GlobSync } from 'glob';
import * as vscode from 'vscode';
import { ProtoFinder } from './find';
import { HeaderController } from './header';

const		headerMap	: Map<string, HeaderController> = new Map<string, HeaderController>();
const		finder		: ProtoFinder	= new ProtoFinder();
let			isEnabled	: boolean = true;

function getRoot(uri:string) : undefined | string {
	let workspaces : readonly vscode.WorkspaceFolder[] | undefined = vscode.workspace.workspaceFolders;
	if (workspaces === undefined) {
		return undefined;
	}
	for (let i = 0; i < workspaces.length; i++) {
		const e = workspaces[i];
		if (uri.startsWith(e.uri.path))
			{return e.uri.path;}
	}
	return undefined;
}

function updateFile(text: string, uri :string) {
	//console.log("--------------------");
	const root = getRoot(uri);

	if (root === undefined)
	{
		vscode.window.showInformationMessage("No workspaces found!");
	}
	else
	{
		const path = finder.getHeader(text, root);
		if (path === "")
		{
			vscode.window.showErrorMessage("Cant find header, no prototypes added");
		}
		else
		{
			if (headerMap.get(path) === undefined)
				headerMap.set(path, new HeaderController(path));
			headerMap.get(path)?.updateHeader(finder.getPrototypes(text));
		}
	}
}

export function activate(context: vscode.ExtensionContext) {

	let disposables: vscode.Disposable[] = [];

	disposables.push(vscode.commands.registerCommand("protofy.enableProtofy", () => {
		isEnabled = true;
		vscode.window.showInformationMessage('Protofy is enabled!');
	}));

	disposables.push(vscode.commands.registerCommand("protofy.disableProtofy", () => {
		isEnabled = false;
		vscode.window.showInformationMessage('Protofy is disabled!');
	}));

	disposables.push(vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
		if (document.languageId === "c" && document.uri.scheme === "file" && isEnabled) {
			updateFile(document.getText(), document.uri.path);
		}
	}));

	for (let i = 0; i < disposables.length; i++) {
		const e = disposables[i];
		
		context.subscriptions.push(e);
	}
}

// this method is called when your extension is deactivated
export function deactivate() {} {}
