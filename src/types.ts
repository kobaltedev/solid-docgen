import { Type } from "ts-morph";

export interface Documentation {
	composes?: string[];
	description?: string;
	displayName?: string;
	methods?: MethodDescriptor[];
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

export interface UnionType extends BaseType {
	name: "union";
	values: TypeDescriptor[];
	raw?: string;
}

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
	raw?: string;
}

export interface BooleanType extends BaseType {
	name: "boolean";
}

export interface ObjectType extends BaseType {
	name: "object";
	properties: Record<string, TypeDescriptor & { required?: boolean }>;
}

export type TypeDescriptor =
	| LiteralType
	| UnionType
	| UnknownType
	| NullType
	| UndefinedType
	| BooleanType
	| ObjectType;

export interface PropDescriptor {
	type: TypeDescriptor;
	required?: boolean;
	defaultValue?: this["type"] extends LiteralType
		? this["type"]["value"]
		: this["type"] extends BooleanType
			? boolean
			: this["type"] extends UnionType
				? this["type"]["values"][]
				: unknown;
	description?: string;
}
