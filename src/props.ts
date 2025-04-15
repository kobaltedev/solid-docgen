import {
	type ParameterDeclaration,
	type Project,
	type Symbol as TsSymbol,
	type Type,
	printNode,
	ts,
} from "ts-morph";
import type {
	BooleanType,
  LiteralType,
	NullType,
	ObjectType,
	PropDescriptor,
	SimpleType,
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
			const required = !prop.isOptional();

			props[name] = {
				type: parseType(prop.getValueDeclarationOrThrow().getType()),
				required,
			};

			if (description && ts.displayPartsToString(description).trim() !== "") {
				props[name].description = ts.displayPartsToString(description);
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

	if (type.isObject() || type.isInterface() || type.isAnonymous()) {
		return {
			name: "object",
			properties: Object.fromEntries(type.getProperties().map((prop) => {
				let parsed = parseType(prop.getValueDeclarationOrThrow().getType());

				if (parsed.name === "union" && prop.isOptional()) {
					if (parsed.values.filter((v) => v.name !== "undefined").length === 1) {
						parsed = parsed.values.filter((v) => v.name !== "undefined")[0];
					} else if (parsed.values.filter((v) => v.name !== "undefined").length > 1) {
						parsed.values = parsed.values.filter((v) => v.name !== "undefined");
					}
				}

				return [
					prop.getName(),
					{
						...parsed,
						required: !prop.isOptional(),
					},
				]
			})),
		} as ObjectType;
	}
	
	return {
		name: "unknown",
    raw: type.getText(),
	};
}
