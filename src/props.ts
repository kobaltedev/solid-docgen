import {
	type ParameterDeclaration,
	type Project,
	type Type,
	ts,
} from "ts-morph";
import type {
	BooleanType,
	LiteralType,
	NullType,
	NumberType,
	ObjectType,
	PropDescriptor,
	StringType,
	TypeDescriptor,
	UndefinedType,
	UnionType,
} from "./types";

export function parseProps(
	project: Project,
	params: ParameterDeclaration[],
): Record<string, PropDescriptor> {
	const props: Record<string, PropDescriptor> = {};

	if (params.length === 0) {
		return props;
	}

	const rawPropsType = params[0].getType();

	if (rawPropsType.isInterface() || rawPropsType.isAnonymous()) {
		const propsType: Type<ts.Type> = rawPropsType;

		for (const prop of propsType.getProperties()) {
			const name = prop.getName();
			const description = prop.compilerSymbol.getDocumentationComment(
				project.getTypeChecker().compilerObject,
			);
			const jsDocTags = prop.getJsDocTags();
			const required = !prop.isOptional();

			props[name] = {
				type: parseType(prop.getValueDeclarationOrThrow().getType()),
				required,
			};

			if (description && ts.displayPartsToString(description).trim() !== "") {
				props[name].description = ts.displayPartsToString(description);
			}

			const descriptionTag =
				jsDocTags.find((t) => t.getName() === "description") ??
				jsDocTags.find((t) => t.getName() === "desc");
			if (
				descriptionTag &&
				ts.displayPartsToString(descriptionTag.getText()).trim() !== ""
			) {
				props[name].description = ts.displayPartsToString(
					descriptionTag.getText(),
				);
			}

			const defaultValue =
				jsDocTags.find((t) => t.getName() === "default") ??
				jsDocTags.find((t) => t.getName() === "defaultvalue");
			if (
				defaultValue &&
				ts.displayPartsToString(defaultValue.getText()).trim() !== ""
			) {
				props[name].defaultValue = parseRawValue(
					ts.displayPartsToString(defaultValue.getText()),
				);
			}
		}
	}

	return props;
}

function parseType(type: Type<ts.Type>): TypeDescriptor {
	if (type.isUnion()) {
		if (type.getText() === "boolean") {
			return {
				name: "boolean",
			} as BooleanType;
		}

		return {
			name: "union",
			values: type.getUnionTypes().map(parseType),
			raw: type.getText(),
		} as UnionType;
	}

	if (type.isBooleanLiteral()) {
		return {
			name: "literal",
			value: type.getText() === "true",
		} as LiteralType;
	}

	if (type.isLiteral()) {
		return {
			name: "literal",
			value: type.getLiteralValue(),
		} as LiteralType;
	}

	if (type.isUndefined()) {
		return {
			name: "undefined",
		} as UndefinedType;
	}

	if (type.isNull()) {
		return {
			name: "null",
		} as NullType;
	}

	if (type.isString()) {
		return {
			name: "string",
		} as StringType;
	}

	if (type.isNumber()) {
		return {
			name: "number",
		} as NumberType;
	}

	if (type.isObject() || type.isInterface() || type.isAnonymous()) {
		return {
			name: "object",
			properties: Object.fromEntries(
				type.getProperties().map((prop) => {
					let parsed = parseType(prop.getValueDeclarationOrThrow().getType());

					if (parsed.name === "union" && prop.isOptional()) {
						if (
							parsed.values.filter((v) => v.name !== "undefined").length === 1
						) {
							parsed = parsed.values.filter((v) => v.name !== "undefined")[0];
						} else if (
							parsed.values.filter((v) => v.name !== "undefined").length > 1
						) {
							parsed.values = parsed.values.filter(
								(v) => v.name !== "undefined",
							);
						}
					}

					return [
						prop.getName(),
						{
							...parsed,
							required: !prop.isOptional(),
						},
					];
				}),
			),
		} as ObjectType;
	}

	return {
		name: "unknown",
		raw: type.getText(),
	};
}

function parseRawValue(value: string): TypeDescriptor;
function parseRawValue(value: unknown, parse: false): TypeDescriptor;
function parseRawValue(value: unknown | string, parse = true): TypeDescriptor {
	const parsed = parse ? JSON.parse(value as string) : value;

	if (
		typeof parsed === "string" ||
		typeof parsed === "number" ||
		typeof parsed === "boolean"
	) {
		return {
			name: "literal",
			value: parsed,
		} as LiteralType;
	}

	if (typeof parsed === "object" && parsed !== null) {
		return {
			name: "object",
			properties: Object.fromEntries(
				Object.entries(parsed).map(([key, value]) => [
					key,
					parseRawValue(value, false),
				]),
			),
		} as ObjectType;
	}

	return {
		name: "unknown",
		raw: !parse ? JSON.stringify(value) : (value as string),
	};
}
