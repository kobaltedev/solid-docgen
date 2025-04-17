import {
	type Transform,
	createFileSystem,
	createMonacoTypeDownloader,
	isUrl,
	parseHtmlWorker,
	transformModulePaths,
} from "@bigmistqke/repl";
import { createRoot } from "solid-js";
import ts from "typescript";

const typeDownloader = createMonacoTypeDownloader({
	target: 2,
	esModuleInterop: true,
});

const transformJs: Transform = ({ path, source, executables }) => {
	return transformModulePaths(source, (modulePath) => {
		if (isUrl(modulePath)) {
			// Return url directly
			return modulePath;
		}

		typeDownloader.downloadModule(modulePath);
		// Wrap external modules with esm.sh
		return `https://esm.sh/${modulePath}`;
	})!;
};

const fs = createRoot(() =>
	createFileSystem({
		css: { type: "css" },
		js: {
			type: "javascript",
			transform: transformJs,
		},
		ts: {
			type: "javascript",
			transform({ path, source, executables }) {
				return transformJs({
					path,
					source: ts.transpile(source, typeDownloader.tsconfig()),
					executables,
				});
			},
		},
		html: {
			type: "html",
			transform(config) {
				const html = parseHtmlWorker(config)
					// Transform content of all `<script type="module" />` elements
					.transformModuleScriptContent(transformJs)
					// Bind relative `src`-attribute of all `<script/>` elements to FileSystem
					.bindScriptSrc()
					// Bind relative `href`-attribute of all `<link/>` elements to FileSystem
					.bindLinkHref()
					.toString();
				return html;
			},
		},
	}),
);

const methods = {
	watchTsconfig: typeDownloader.watchTsconfig,
	watchTypes: typeDownloader.watchTypes,
	watchExecutable: fs.watchExecutable,
	writeFile: fs.writeFile,
	watchDir: fs.watchDir,
	watchFile: fs.watchFile,
	getType: fs.getType,
	watchPaths: fs.watchPaths,
};

export default methods;

// Initialize worker-methods
// export default methods

// Export types of methods to infer the WorkerProxy's type
export type Methods = typeof methods;
