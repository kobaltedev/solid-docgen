import {
	type ArrowFunction,
	type FunctionDeclaration,
	Node,
	type ParameterDeclaration,
	Project,
	type SourceFile,
	ts,
} from "ts-morph";
import { parseProps } from "./props";
import type { Documentation } from "./types";

type Component = {
	getName: () => string;
	getParameters: () => ParameterDeclaration[];
	getDescription: () => string | undefined;
};

function getProject() {
	const project = new Project({
		compilerOptions: {
			target: ts.ScriptTarget.ESNext,
			module: ts.ModuleKind.ESNext,
			allowSyntheticDefaultImports: true,
			esModuleInterop: true,
			isolatedModules: true,
			jsxImportSource: "solid-js",
			strict: true,
			skipLibCheck: true,
			lib: ["dom", "esnext"],
			types: ["solid-js"],
		},
	});

	return project;
}

export function parse(code: string): Documentation[] {
	const project = getProject();
	const sourceFile = project.createSourceFile("input.tsx", code);

	return getExportedComponents(sourceFile).map((c) => {
		return {
			displayName: c.getName(),
			props: parseProps(project, c.getParameters()),
			description: c.getDescription(),
		};
	});
}

function getExportedComponents(sourceFile: SourceFile): Component[] {
	const components: Component[] = [];

	for (const [name, value] of sourceFile.getExportedDeclarations().entries()) {
		if (Node.isFunctionDeclaration(value[0])) {
			components.push(
				toComponent(
					value[0],
					name,
					value[0].getJsDocs()[0]?.getDescription().trim(),
				),
			);
		}

		if (Node.isVariableDeclaration(value[0])) {
			const initializer = value[0].getInitializer();
			if (Node.isArrowFunction(initializer)) {
				components.push(
					toComponent(
						initializer,
						name,
						value[0]
							.getVariableStatement()
							?.getJsDocs()[0]
							?.getDescription()
							.trim(),
					),
				);
			}
		}
	}

	return components;
}

function toComponent(
	f: ArrowFunction | FunctionDeclaration,
	name: string,
	description?: string,
): Component {
	const wrapped = f as unknown as Component;

	wrapped.getName = () => name;
	wrapped.getDescription = () => description;

	return wrapped;
}

export type * from "./types";
