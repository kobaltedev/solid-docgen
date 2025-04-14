import {Project, SourceFile, FunctionDeclaration, Node, SyntaxKind, ArrowFunction, ParameterDeclaration, Type, ts} from "ts-morph";
import { Documentation } from "./types";
import { parseProps } from "./props";

type Component = {
    getName: () => string;
    getParameters: () => ParameterDeclaration[];
};

function getProject() {
    const project = new Project({
        compilerOptions: {
            "target": ts.ScriptTarget.ESNext,
            "module": ts.ModuleKind.ESNext,
            "allowSyntheticDefaultImports": true,
            "esModuleInterop": true,
            "isolatedModules": true,
            "jsxImportSource": "solid-js",
            "skipLibCheck": true,
            "lib": ["dom", "esnext"],
            "types": ["solid-js"],
        },
    });

    return project;
}

export function parse(code: string): Documentation[] {
    const project = getProject();
    const sourceFile = project.createSourceFile("input.tsx", code);

	return getExportedComponents(sourceFile).map(f => {
		return {
			displayName: f.getName(),
			props: parseProps(project, f.getParameters()),
		};
	});
}

function getExportedComponents(sourceFile: SourceFile): Component[] {
    const exportedFunctions = sourceFile.getFunctions()
        .filter(f => f.isExported())
        .map(f => wrapWithName(f, f.getName() ?? ""));

    const exportedVariables = sourceFile.getVariableDeclarations()
        .filter(v => v.isExported() && Node.isArrowFunction(v.getInitializer()))
        .map(v => wrapWithName(v.getInitializer() as ArrowFunction, v.getName()!));

	return [...exportedFunctions, ...exportedVariables];
}

function wrapWithName(f: ArrowFunction | FunctionDeclaration, name: string): Component {
    const wrapped = f as Component;

    wrapped.getName = () => name;

	return wrapped;
}