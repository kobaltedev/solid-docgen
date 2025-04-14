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

export interface BaseType {
	required?: boolean;
	nullable?: boolean;
	alias?: string;
}

export interface SimpleType extends BaseType {
	name: string;
	raw?: string;
}

export interface UnionType extends BaseType {
	name: "union";
	values: string[];
}

export interface LiteralType extends BaseType {
	name: "literal";
	value: string;
}

// export interface ElementsType<T = FunctionSignatureType> extends BaseType {
//   name: string;
//   raw: string;
//   elements: Array<TypeDescriptor<T>>;
// }

// export interface FunctionArgumentType<T> {
//   name: string;
//   type?: TypeDescriptor<T>;
//   rest?: boolean;
// }

// export interface FunctionSignatureType extends BaseType {
//   name: 'signature';
//   type: 'function';
//   raw: string;
//   signature: {
//     arguments: Array<FunctionArgumentType<FunctionSignatureType>>;
//     return?: TypeDescriptor<FunctionSignatureType>;
//   };
// }

// export interface TSFunctionSignatureType extends FunctionSignatureType {
//   signature: {
//     arguments: Array<FunctionArgumentType<TSFunctionSignatureType>>;
//     return?: TypeDescriptor<TSFunctionSignatureType>;
//     this?: TypeDescriptor<TSFunctionSignatureType>;
//   };
// }

// export interface ObjectSignatureType<T = FunctionSignatureType>
//   extends BaseType {
//   name: 'signature';
//   type: 'object';
//   raw: string;
//   signature: {
//     properties: Array<{
//       key: TypeDescriptor<T> | string;
//       value: TypeDescriptor<T>;
//       description?: string;
//     }>;
//     constructor?: TypeDescriptor<T>;
//   };
// }

export type TypeDescriptor =
	// | ElementsType<TSFunctionSignatureType>
	| LiteralType
	// | ObjectSignatureType<TSFunctionSignatureType>
	| SimpleType;
// | T;

export interface PropDescriptor {
	type: TypeDescriptor;
	required?: boolean;
	defaultValue?: unknown;
	description?: string;
}
