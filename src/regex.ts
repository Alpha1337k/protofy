export let cSourceRegX		: RegExp = /([\w_]+)\s+([*]+)([\w_\d]+)\(([\w\s\d*\\_,]+)\)/g;
export let cHeaderRegX		: RegExp = /([\w_]+)\s+([*]+)([\w_\d]+)\(([\w\s\d*\\_,]+)\);/g;
export let cIncludeRegX		: RegExp = /#\s*include\s+[<"]([A-z_.0-9_]+)[>"]/g;
