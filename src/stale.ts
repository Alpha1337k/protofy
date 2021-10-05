import * as vscode from 'vscode';
import * as fs from 'fs';
import { ProtoFinder, ProtoStruct } from './find';
import { HeaderController } from './header';

export class Stale {
	constructor() {
		
	}

	async clearstale(headerMap	: Map<string, HeaderController>): Promise<number>
	{
		let		prototypes	: ProtoStruct[] = [];
		const	finder		: ProtoFinder = new ProtoFinder();
		let		rval		: number = 0;

		let headers = await vscode.workspace.findFiles("**/*.c", '');
		
		for (let i = 0; i < headers.length; i++) {
			const e = headers[i];
			const prots : ProtoStruct[] = finder.getPrototypes(fs.readFileSync(e.path, 'utf-8'));
			prototypes = prototypes.concat(prots);
		}

		headerMap.forEach((v: HeaderController, k: string) => {
			rval += v.cleanStaleHeader(prototypes);
		});

		return (rval);
	}
}