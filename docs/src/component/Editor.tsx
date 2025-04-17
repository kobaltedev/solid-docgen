import { getExtension } from "@bigmistqke/repl";
import type { WorkerProxy } from "@bigmistqke/worker-proxy";
import loader from "@monaco-editor/loader";
import type { languages } from "monaco-editor";
import {
	createEffect,
	createMemo,
	createResource,
	createSignal,
	mapArray,
	mergeProps,
	on,
	onCleanup,
} from "solid-js";
import type { Methods } from "~/worker/fs.worker";

export function Editor(props: {
	fs: WorkerProxy<Methods>;
	path: string;
	types?: Record<string, string>;
	tsconfig: languages.typescript.CompilerOptions;
	languages?: Record<string, string>;
}) {
	const [paths, setPaths] = createSignal<Array<string>>([]);
	const [monaco] = createResource(() => loader.init());
	const [element, setElement] = createSignal<HTMLDivElement>();

	const editor = createMemo(() => {
		if (!monaco() || !element()) return;

		return monaco()!.editor.create(element()!, {
			value: "",
			language: "typescript",
			automaticLayout: true,
		});
	});

	createEffect(() => props.fs.watchPaths(setPaths));

	createEffect(
		on(
			() => [monaco(), editor()] as const,
			([monaco, editor]) => {
				if (!monaco || !editor) return;

				const languages = mergeProps(
					{
						tsx: "typescript",
						ts: "typescript",
					},
					() => props.languages,
				);

				async function getType(path: string) {
					let type: string = await props.fs.$async.getType(path);
					const extension = getExtension(path);
					if (extension && extension in languages) {
						type = languages[extension]!;
					}
					return type;
				}

				createEffect(() => {
					editor.onDidChangeModelContent((event) => {
						props.fs.writeFile(props.path, editor.getModel()!.getValue());
					});
				});

				createEffect(
					mapArray(paths, (path) => {
						createEffect(async () => {
							const type = await getType(path);
							if (type === "dir") return;
							const uri = monaco.Uri.parse(`file:///${path}`);
							const model =
								monaco.editor.getModel(uri) ||
								monaco.editor.createModel("", type, uri);
							props.fs.watchFile(path, (value) => {
								if (value !== model.getValue()) {
									model.setValue(value || "");
								}
							});
							onCleanup(() => model.dispose());
						});
					}),
				);

				createEffect(async () => {
					const uri = monaco.Uri.parse(`file:///${props.path}`);
					const type = await getType(props.path);
					const model =
						monaco.editor.getModel(uri) ||
						monaco.editor.createModel("", type, uri);
					editor.setModel(model);
				});

				createEffect(() => {
					if (props.tsconfig) {
						monaco.languages.typescript.typescriptDefaults.setCompilerOptions(
							props.tsconfig,
						);
						monaco.languages.typescript.javascriptDefaults.setCompilerOptions(
							props.tsconfig,
						);
					}
				});

				createEffect(
					mapArray(
						() => Object.keys(props.types ?? {}),
						(name) => {
							createEffect(() => {
								const declaration = props.types?.[name];
								if (!declaration) return;
								const path = `file:///${name}`;
								monaco.languages.typescript.typescriptDefaults.addExtraLib(
									declaration,
									path,
								);
								monaco.languages.typescript.javascriptDefaults.addExtraLib(
									declaration,
									path,
								);
							});
						},
					),
				);
			},
		),
	);

	return <div ref={setElement} style={{ overflow: "hidden" }} />;
}
