import {
	Transform,
	createFileSystem,
	parseHtml,
	resolvePath,
	transformModulePaths,
} from "@bigmistqke/repl";
import type { languages } from "monaco-editor";
import { createEffect, createSignal } from "solid-js";
import ts from "typescript";
import type { Methods } from "~/worker/fs.worker";
import Worker from "~/worker/fs.worker?worker-proxy";
import { Editor } from "./Editor";

export function Playground() {
	const [url, setUrl] = createSignal<string>();
	const [tsconfig, setTsconfig] =
		createSignal<languages.typescript.CompilerOptions>({});
	const [types, setTypes] = createSignal<Record<string, string>>();

	const fs = new Worker<Methods>();

	fs.watchTsconfig(setTsconfig);
	fs.watchTypes(setTypes);
	fs.watchExecutable("main.ts", setUrl);

	fs.writeFile(
		"main.ts",
		`
    interface Props {
      name: string
    }

    export function Component(props: Props) {
      return <div>Hello {props.name}</div>
    }
  `,
	);

	createEffect(() => {
		console.log(url());
	});

	return (
		<div>
			<Editor fs={fs} path={"main.ts"} tsconfig={tsconfig()} types={types()} />
		</div>
	);
}
