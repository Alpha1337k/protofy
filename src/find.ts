import { glob, GlobSync } from 'glob';
import { HeaderController } from './header';
import { cSourceRegX, cIncludeRegX } from "./regex";


export class ProtoStruct {
    name    : string;
    rType   : string;
	rPtr	: string;
    args	: string[] = [];
    constructor(name : string, rType : string, rPtr: string, args : string[]) {
        this.name =		name;
		this.rType =	rType;
		this.args =		args;
		this.rPtr =		rPtr;
	}
}

export class ProtoFinder {
    constructor() {}

    getPrototypes(text: string) : ProtoStruct[]
	{
		let rval : ProtoStruct[]	= [];
		let regx : RegExp			= cSourceRegX;

		let match;
		while ((match = regx.exec(text)) !== null) {
			rval.push(new ProtoStruct(match[3], match[1], match[2], match[4].split(',')));
		}

		return rval;
	}

	getHeader(text: string, workspaceUrl: string | undefined, headers : Map<string, HeaderController>) : string
	{
		if (workspaceUrl === undefined)
			return "";
		let regx : RegExp	= cIncludeRegX;
	
		let match : any;
		let rval : any;
		console.log("length", headers.size);
		while ((match = regx.exec(text)) !== null) {

			for (const [key, value] of headers)
			{
				if (key.endsWith(match[1]))
				{
					console.log("mets!!!");
					return key;
				}
			}
		}
		return '';
	}
}