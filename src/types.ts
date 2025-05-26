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

export interface VoidType extends BaseType {
	name: "void";
}

export interface UnknownType extends BaseType {
	name: "unknown";
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

export interface ArrayType extends BaseType {
	name: "array";
	type: TypeDescriptor;
}

export interface ObjectType extends BaseType {
	name: "object";
	properties: Record<string, TypeDescriptor & { required?: boolean }>;
}

export interface FunctionType extends BaseType {
	name: "function";
	parameters: Record<
		string,
		TypeDescriptor & { required?: boolean; rest?: boolean }
	>;
	return: TypeDescriptor;
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

export interface UnparsedType {
	name: "unparsed";
	raw: string;
}

export type TypeDescriptor =
	| LiteralType
	| UnknownType
	| VoidType
	| NullType
	| UndefinedType
	| BooleanType
	| ObjectType
	| StringType
	| NumberType
	| FunctionType
	| ArrayType
	| UnionType
	| IntersectionType
	| UnparsedType;

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
	internal?: boolean;
}
