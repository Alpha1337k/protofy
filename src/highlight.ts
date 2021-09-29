import * as vscode	from 'vscode';
import { cIncludeRegX } from "./regex";

export function getHeaderRange(document: vscode.TextDocument, files : vscode.Uri[]) {

	for (let i = 0; i < document.lineCount; i++) {
		const element = document.lineAt(i);
		let match = element.text.match(cIncludeRegX);
		if (match !== null)
		{
			if (files.find(x => x.path.endsWith(match![1])))
			{
				console.log("found file!", match);
				return {hoverMessage: "protofy is using this header, since its the first found header", 
						range: new vscode.Range(
								new vscode.Position(i, 0),
								new vscode.Position(i, element.text.length)
						)};
			}
		}
	}
	return undefined;
}