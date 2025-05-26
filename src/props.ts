import {
	type ParameterDeclaration,
	type Project,
	type Type,
	ts,
} from "ts-morph";
import type {
	ArrayType,
	BooleanType,
	FunctionType,
	IntersectionType,
	LiteralType,
	NullType,
	NumberType,
	ObjectType,
	PropDescriptor,
	StringType,
	TypeDescriptor,
	UndefinedType,
	UnionType,
	UnknownType,
	VoidType,
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
				type: parseType(prop.getValueDeclarationOrThrow().getType(), required),
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

			if (jsDocTags.find((t) => t.getName() === "internal")) {
				props[name].internal = true;
			}
		}
	}

	return props;
}

function parseType(type: Type<ts.Type>): TypeDescriptor;
function parseType(type: Type<ts.Type>, required: boolean): TypeDescriptor;
function parseType(type: Type<ts.Type>, required = true): TypeDescriptor {
	if (type.isUnion()) {
		if (type.getText() === "boolean") {
			return {
				name: "boolean",
				raw: type.getText(),
			} as BooleanType;
		}

		return omitUndefinedFromUnion(
			{
				name: "union",
				values: type
					.getUnionTypes()
					.map(parseType)
					.sort((a, b) => {
						if (a.name === "undefined") return 1;
						if (b.name === "undefined") return -1;
						if (a.name === "null") return 1;
						if (b.name === "null") return -1;

						return 0;
					}),
				raw: type.getText(),
			},
			required,
		) as UnionType;
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

	if (type.isVoid()) {
		return {
			name: "void",
		} as VoidType;
	}

	if (type.isUnknown()) {
		return {
			name: "unknown",
		} as UnknownType;
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

	if (type.isArray()) {
		return {
			name: "array",
			type: parseType(type.getArrayElementTypeOrThrow()),
		} as ArrayType;
	}

	if (type.isAnonymous() && type.getCallSignatures().length >= 1) {
		return {
			name: "function",
			parameters: Object.fromEntries(
				type
					.getCallSignatures()[0]
					.getParameters()
					.map((param) => {
						const parsed = parseType(
							param.getValueDeclarationOrThrow().getType(),
						);
						const compilerNode = param.getValueDeclarationOrThrow()
							.compilerNode as ts.Node & {
							questionToken?: unknown;
							dotDotDotToken?: unknown;
						};
						const required = compilerNode.questionToken === undefined;
						const rest = compilerNode.dotDotDotToken !== undefined;

						return [
							param.getName(),
							{
								...omitUndefinedFromUnion(parsed, required),
								required: required ? true : undefined,
								rest: rest ? true : undefined,
							},
						] as [string, FunctionType["parameters"][string]];
					})
			),
			return: parseType(type.getCallSignatures()[0].getReturnType()),
		} as FunctionType;
	}

	if (type.isObject() || type.isInterface() || type.isAnonymous()) {
		return {
			name: "object",
			properties: Object.fromEntries(
				type.getProperties().map((prop) => {
					const parsed = parseType(prop.getValueDeclarationOrThrow().getType());

					return [
						prop.getName(),
						{
							...omitUndefinedFromUnion(parsed, !prop.isOptional()),
							required: !prop.isOptional() ? true : undefined,
						},
					] as [string, ObjectType["properties"][string]];
				}),
			),
		} as ObjectType;
	}

	if (type.isIntersection()) {
		return {
			name: "intersection",
			values: type.getIntersectionTypes().map(parseType),
			raw: type.getText(),
		} as IntersectionType;
	}

	return {
		name: "unparsed",
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
			raw: !parse ? JSON.stringify(value) : (value as string),
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
			raw: !parse ? JSON.stringify(value) : (value as string),
		} as ObjectType;
	}

	return {
		name: "unparsed",
		raw: !parse ? JSON.stringify(value) : (value as string),
	};
}

function omitUndefinedFromUnion(
	parsed: TypeDescriptor,
	required: boolean,
): TypeDescriptor {
	if (parsed.name === "union" && !required) {
		if (parsed.values.filter((v) => v.name !== "undefined").length === 1) {
			return parsed.values.filter((v) => v.name !== "undefined")[0];
		}
		if (parsed.values.filter((v) => v.name !== "undefined").length > 1) {
			parsed.values = parsed.values.filter((v) => v.name !== "undefined");
		}
	}

	return parsed;
}
