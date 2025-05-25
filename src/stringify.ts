import type { TypeDescriptor } from "./types";

export function stringifyType(type: TypeDescriptor): string;
export function stringifyType(type: TypeDescriptor, indent: string): string;
export function stringifyType(
	type: TypeDescriptor,
	indent: string,
	objSep: string,
): string;
export function stringifyType(
	type: TypeDescriptor,
	indent: string,
	objSep: string,
	maxObjLen: number,
): string;
export function stringifyType(
	type: TypeDescriptor,
	indent = "  ",
	objSep = ";",
	maxObjLen = 40,
): string {
	if (
		type.name === "undefined" ||
		type.name === "null" ||
		type.name === "boolean" ||
		type.name === "number" ||
		type.name === "string"
	)
		return type.name;

	if (type.name === "unknown") return type.raw;

	if (type.name === "literal") return JSON.stringify(type.value);

	if (type.name === "union")
		return type.values
			.map((v) => stringifyType(v, indent, objSep, maxObjLen))
			.join(" | ");

	if (type.name === "intersection")
		return type.values.map((v) => stringifyType(v, indent, objSep)).join(" & ");

	if (type.name === "object") {
		if (Object.keys(type.properties).length === 0) return "{}";

		let obj = "{$SOLID_DOCGEN_NEWLINE$";

		for (const key in type.properties) {
			const objType = type.properties[key];
			obj += `${indent}${escapeTypeKey(key)}${objType.required ? "" : "?"}: ${stringifyType(objType, indent, objSep, maxObjLen).replaceAll("$SOLID_DOCGEN_NEWLINE$", `$SOLID_DOCGEN_NEWLINE$${indent}`)}${objSep}$SOLID_DOCGEN_NEWLINE$`;
		}

		obj += "}";

		if (obj.replaceAll(/\$SOLID_DOCGEN_NEWLINE\$\s*/g, " ").length < maxObjLen)
			obj = obj.replaceAll(/\$SOLID_DOCGEN_NEWLINE\$\s*/g, " ");
		else obj = obj.replaceAll("$SOLID_DOCGEN_NEWLINE$", "\n");

		return obj;
	}

	return "unknown";
}

function escapeTypeKey(key: string): string {
	if (/^[$_\p{ID_Start}][$\p{ID_Continue}]*/u.test(key)) return key;
	return JSON.stringify(key);
}
