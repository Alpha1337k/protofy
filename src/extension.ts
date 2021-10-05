/* eslint-disable curly */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { glob, GlobSync } from 'glob';
import { performance } from 'perf_hooks';
import * as vscode from 'vscode';
import { ProtoFinder } from './find';
import { HeaderController } from './header';
import { getHeaderRange } from './highlight';
import { Stale } from './stale';

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

async function updateFile(text: string, uri :string) {
	console.log("--------------------");
	const root = getRoot(uri);

	if (root === undefined)
	{
		vscode.window.showInformationMessage("No workspaces found!");
	}
	else
	{
		const path = finder.getHeader(text, root, headerMap);
		
		console.log("Path: ", path);
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

async function updateHighlight(e: vscode.TextEditor | undefined) {
	if (e === undefined)
		return;
	vscode.workspace.findFiles('**/*.h', '', undefined).then((files: vscode.Uri[]) => {
		let decors = [];
		const decor = getHeaderRange(e.document, files);
		if (decor === undefined)
		{
			console.log("header not found for highlighting");
			return;
		}
		decors.push(decor);
		e.setDecorations(notifyDecoration, decors);
	});
}

const notifyDecoration = vscode.window.createTextEditorDecorationType({
	overviewRulerColor: 'rgba(0, 255, 0, 0.2)',
	overviewRulerLane: vscode.OverviewRulerLane.Right,
	backgroundColor: 'rgba(0,255,0,0.2)',
});

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

	disposables.push(vscode.commands.registerCommand("protofy.clearStale", () => {
		let s : Stale = new Stale();
		
		s.clearstale(headerMap).then((count : number) => {
			vscode.window.showInformationMessage(`Protofy removed ${count} prototypes!`);
		});
	}));

	disposables.push(vscode.window.onDidChangeActiveTextEditor((e : vscode.TextEditor | undefined) => {
		console.log("changed editor", e, e?.document.languageId, e?.document.uri.scheme, isEnabled);
		if (e === undefined || e.document.languageId !== 'c' || e.document.uri.scheme !== "file" || isEnabled === false)
			return;
		updateHighlight(e);
	}));

	disposables.push(vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
		if (document.languageId === "c" && document.uri.scheme === "file" && isEnabled)
		{
			let startTime = performance.now();
			updateHighlight(vscode.window.activeTextEditor);
			updateFile(document.getText(), document.uri.path).then(() => {
				let endTime = performance.now();
				console.log(`time wasted: ${endTime - startTime}ms`);
			}).catch((err) => {
				console.log("error! idk", err);
			});
		}
	}));

	vscode.workspace.findFiles("**/*.h", '').then((headers: vscode.Uri[]) => {
		for (let i = 0; i < headers.length; i++) {
			const e = headers[i];
			console.log("Path::",e.path, headerMap.get(e.path));
			if (headerMap.get(e.path) === undefined)
			{
				headerMap.set(e.path, new HeaderController(e.path));
			}
			console.log("header len: ", headerMap.size);
		}
	});

	for (let i = 0; i < disposables.length; i++) {
		const e = disposables[i];
		context.subscriptions.push(e);
	}
}

// this method is called when your extension is deactivated
export function deactivate() {} {}
