/* eslint-disable curly */
import { ProtoStruct } from "./find";
import * as vscode from 'vscode';
import { readFileSync, writeFileSync } from "fs";

interface DetailedProt {
    p: ProtoStruct;
	start: number;
}

function arrayCompare(a1:string[], a2: string[]): boolean {


	if (a1 !== a2)
		return false;
	for (let i = 0; i < a1.length; i++) {
		if (a1[i] !== a2[i])
			return false;
	}
	return true;
}

export class HeaderController {
	prot		: DetailedProt[] = [];
	file		: string[] = [];
	filepath	: string;
	filename	: string;
	isProtected	: boolean = false;
	startProt	: number = 0;
	endProt		: number = 0;

	constructor(filepath : string) {
		this.filename = filepath.substring(filepath.lastIndexOf("/") + 1, filepath.lastIndexOf("."));
		this.filepath = filepath;
		this.readFile();
	}

	readFile() {
		this.file = readFileSync(this.filepath, "utf-8").split('\n');
		this.endProt = this.file.findIndex(x => x === "#endif") - 1;

		if (this.file.find(x=> x === "#ifndef " + this.filename.toUpperCase() + "_H"))
			this.isProtected = true;
		if (this.isProtected === false)
		{
			this.addGuards();
		}
		this.readHeader();
	}

	addGuards() {
		this.file.unshift(	"#ifndef " + this.filename.toUpperCase() + "_H",
							"# define " + this.filename.toUpperCase() + "_H");

		this.file.push("#endif");
		this.endProt = 2;
	}

	readHeader()
	{
		let rval :	DetailedProt[]	= [];
		let regx :	RegExp			= /([\w_]+)\s+([*]+)([\w_\d]+)\(([\w\s\d*_,]+)\);/;

		let match;
		for (let i = 0; i < this.file.length; i++) {
			const e = this.file[i];
			match = regx.exec(e);
			if (match !== null && match !== undefined)
			{
				match[2] = match[2].replace('\s', '');
				match[2] = match[2].replace('\t', '');
				rval.push({p: new ProtoStruct(match[3], match[1], match[2], match[4].split(',')), start: i});	
			}
		}
		this.prot = rval;
		return rval;
	}

	updateHeader(data : ProtoStruct[])
	{
		this.readFile();
		for (let i = 0; i < data.length; i++) {
			const e = data[i];
			let x;

			if (e.name === 'main')
				continue;
			if ((x = this.prot.find(x => x.p.name === e.name)))
			{
				this.updatePrototype(e, x, i);
			}
			else if ((x = this.prot.find(x => x.p.rType === e.rType && arrayCompare(e.args, x.p.args))))
			{
				this.updatePrototype(e, x, i);
			}
			else
			{
				this.addPrototype(e);
			}
		}
		this.saveFile();
	}

	cleanStaleHeader(prototypes: ProtoStruct[]) : number
	{
		console.log(`cleaning ${this.filename}`);
		let rval :	number = 0;
		this.readFile();
		console.log(JSON.stringify(prototypes));

		for (let i = 0; i < this.prot.length; i++)
		{
			if (prototypes.find(x => JSON.stringify(x) === JSON.stringify(this.prot[i].p)) === undefined)
			{
				console.log("not found ",  JSON.stringify(this.prot[i].p));
				this.file.splice(this.prot[i].start, 1);
				rval += 1;
			}
		}
		this.saveFile();
		return (rval);
	}

	createPrototype(item : ProtoStruct): string
	{
		return (item.rType + "\t\t" + item.rPtr + item.name + "(" + item.args + ");");
	}

	addPrototype(item : ProtoStruct): void {
		this.file.splice(this.endProt, 0, this.createPrototype(item));
		this.endProt++;
	}

	updatePrototype(item : ProtoStruct, old : DetailedProt, index : number): void {
		this.file[old.start] = this.createPrototype(item);
		old = {p: item, start: old.start};
	}

	saveFile()
	{
		writeFileSync(this.filepath, this.file.join('\n'));
	}
}