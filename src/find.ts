import { glob, GlobSync } from 'glob';
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
			match[2] = match[2].replace('\s', '');
			match[2] = match[2].replace('\t', '');
			rval.push(new ProtoStruct(match[3], match[1], match[2], match[4].split(',')));
		}

		return rval;
	}

	getHeader(text: string, workspaceUrl: string | undefined) : string
	{
		if (workspaceUrl === undefined)
			return "";
		let regx : RegExp	= cIncludeRegX;
		let headerUri : string[] = glob.sync(workspaceUrl + "/**/*.h");
	
		let match : any;
		while ((match = regx.exec(text)) !== null) {
			const rval = headerUri.find(x => x.match(match[1] === null ? '' : match[1]) !== null);
			if (rval !== undefined)
				return rval;
		}
		return '';
	}
}