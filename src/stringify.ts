import type { TypeDescriptor } from "./types";

export interface StringifyOptions {
	indent?: string;
	objSep?: string;
	maxObjLen?: number;
	arrayType?: "Array" | "[]";
}

export function stringifyType(type: TypeDescriptor): string;
export function stringifyType(
	type: TypeDescriptor,
	options: StringifyOptions,
): string;
export function stringifyType(
	type: TypeDescriptor,
	_options?: StringifyOptions,
): string {
	const options: Required<StringifyOptions> = {
		indent: "  ",
		objSep: ";",
		maxObjLen: 50,
		arrayType: "Array",
		..._options,
	};

	if (
		type.name === "undefined" ||
		type.name === "null" ||
		type.name === "boolean" ||
		type.name === "number" ||
		type.name === "string" ||
		type.name === "void" ||
		type.name === "unknown"
	)
		return type.name;

	if (type.name === "literal") return JSON.stringify(type.value);

	if (type.name === "union")
		return type.values.map((v) => stringifyType(v, options)).join(" | ");

	if (type.name === "intersection")
		return type.values.map((v) => stringifyType(v, options)).join(" & ");

	if (type.name === "object") {
		if (Object.keys(type.properties).length === 0) return "{}";

		let obj = "{$SOLID_DOCGEN_NEWLINE$";

		for (const key in type.properties) {
			const objType = type.properties[key];
			obj += `${options.indent}${escapeTypeKey(key)}${objType.required ? "" : "?"}: ${stringifyType(objType, options).replaceAll("$SOLID_DOCGEN_NEWLINE$", `$SOLID_DOCGEN_NEWLINE$${options.indent}`)}${options.objSep}$SOLID_DOCGEN_NEWLINE$`;
		}

		obj += "}";

		const shortNotation = `{${obj.replaceAll(/\$SOLID_DOCGEN_NEWLINE\$\s*/g, " ").slice(2, -options.objSep.length - 2)}}`;

		if (shortNotation.length < options.maxObjLen) {
			obj = shortNotation;
		} else obj = obj.replaceAll("$SOLID_DOCGEN_NEWLINE$", "\n");

		return obj;
	}

	if (type.name === "array") {
		if (options.arrayType === "[]") {
			if (
				type.type.name === "literal" ||
				type.type.name === "undefined" ||
				type.type.name === "null" ||
				type.type.name === "void" ||
				type.type.name === "boolean" ||
				type.type.name === "number" ||
				type.type.name === "string"
			) {
				return `${stringifyType(type.type, options)}[]`;
			}
			return `(${stringifyType(type.type, options)})[]`;
		}
		return `Array<${stringifyType(type.type, options)}>`;
	}

	if (type.name === "function") {
		return `(${Object.entries(type.parameters)
			.map(
				([key, p]) =>
					`${key}${p.required ? "" : "?"}: ${stringifyType(p, options)}`,
			)
			.join(
				", ",
			)}) => ${stringifyType(type.return, { ...options, objSep: "," })}`;
	}

	if (type.name === "unparsed") {
		return `unparsed:${type.raw}`;
	}

	return `unstringified:${JSON.stringify(type)}`;
}

function escapeTypeKey(key: string): string {
	if (/^[$_\p{ID_Start}][$\p{ID_Continue}]*/u.test(key)) return key;
	return JSON.stringify(key);
}
