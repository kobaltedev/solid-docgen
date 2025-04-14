import { InterfaceDeclaration, ParameterDeclaration, Project, Symbol, ts, Type } from "ts-morph";
import { LiteralType, PropDescriptor, SimpleType, TypeDescriptor, UnionType } from "./types";

export function parseProps(project: Project, params: ParameterDeclaration[]): Record<string, PropDescriptor> {
  const props: Record<string, PropDescriptor> = {};
  
  if (params.length === 0) {
    return props;
  }

  const rawPropsType = params[0].getType();

  if (rawPropsType.isInterface() || rawPropsType.isAnonymous()) {
    const propsType: Type<ts.Type> = rawPropsType;


    for (const prop of propsType.getProperties()) {
      const name = prop.getName();
      const description = prop.compilerSymbol.getDocumentationComment(project.getTypeChecker().compilerObject);
      const required = !prop.isOptional();
      
      props[name] = {
        type: parseType(prop),
        required,
      };
  
      if (description && ts.displayPartsToString(description).trim() !== "") {
        props[name].description = ts.displayPartsToString(description);
      }
    }
  }

  return props;
}

function parseType(type: Symbol): TypeDescriptor {
  const resolvedType = type.getDeclarations()[0].getType();;

  // For some reason `undefined` doesn't appear in the union type.
  const hasUndefined = type.getDeclarations()[0].getFirstDescendantByKind(ts.SyntaxKind.UndefinedKeyword) !== undefined;

  if (resolvedType.isUnion()) {
    return {
      name: "union",
      values: [...resolvedType.getUnionTypes().map((t) => t.getText()), hasUndefined ? "undefined" : undefined],
    } as UnionType;
  }

  if (type) {
    return {
      name: type.getDeclarations()[0].getType().getText(),
    } as SimpleType;
  }

  // if (type.isLiteral()) {
  //   return {
  //     name: 'literal',
  //     value: type.getText(),
  //   } as LiteralType;
  // }

  return {
    name: "unknown",
  };
}