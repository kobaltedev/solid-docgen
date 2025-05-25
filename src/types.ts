import { Type } from "ts-morph";

export interface Documentation {
	description?: string;
	displayName?: string;
	props?: Record<string, PropDescriptor>;
}

export interface MethodParameter {
	name: string;
	description?: string;
	optional: boolean;
	// type?: TypeDescriptor<FunctionSignatureType> | null;
}

export interface MethodReturn {
	description?: string;
	// type: TypeDescriptor<FunctionSignatureType> | undefined;
}

export type MethodModifier = "async" | "generator" | "get" | "set" | "static";

export interface MethodDescriptor {
	name: string;
	description?: string | null;
	docblock: string | null;
	modifiers: MethodModifier[];
	params: MethodParameter[];
	returns: MethodReturn | null;
}

export interface BaseType {}

export interface LiteralType extends BaseType {
	name: "literal";
	value: string | boolean | number;
}

export interface UndefinedType extends BaseType {
	name: "undefined";
}

export interface NullType extends BaseType {
	name: "null";
}

export interface UnknownType extends BaseType {
	name: "unknown";
	raw: string;
}

export interface BooleanType extends BaseType {
	name: "boolean";
}

export interface NumberType extends BaseType {
	name: "number";
}

export interface StringType extends BaseType {
	name: "string";
}

export interface ObjectType extends BaseType {
	name: "object";
	properties: Record<string, TypeDescriptor & { required?: boolean }>;
}

export interface UnionType extends BaseType {
	name: "union";
	values: TypeDescriptor[];
	raw: string;
}

export interface IntersectionType extends BaseType {
	name: "intersection";
	values: TypeDescriptor[];
	raw: string;
}

export type TypeDescriptor =
	| LiteralType
	| UnknownType
	| NullType
	| UndefinedType
	| BooleanType
	| ObjectType
	| StringType
	| NumberType
	| UnionType
	| IntersectionType;

export interface PropDescriptor {
	type: TypeDescriptor;
	required?: boolean;
	defaultValue?: TypeDescriptor /*this["type"] extends LiteralType
		? this["type"]["value"]
		: this["type"] extends BooleanType
			? boolean
			: this["type"] extends UnionType
				? this["type"]["values"][]
				: unknown*/;
	description?: string;
}
