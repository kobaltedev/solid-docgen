import workerPlugin from "@bigmistqke/vite-plugin-worker-proxy";
import { withSolidBase } from "@kobalte/solidbase/config";
import { defineConfig } from "@solidjs/start/config";

export default defineConfig(
	withSolidBase(
		{
			vite: {
				plugins: [workerPlugin()],
			},
			server: {
				esbuild: {
					options: {
						target: "esnext",
					},
				},
			},
		},
		{
			title: "Solid-Docgen",
			description: "Documentation for Solid-Docgen",
			themeConfig: {
				nav: [
					{
						text: "Docs",
						link: "/guide",
					},
					{
						text: "Playground",
						link: "/playground",
					},
				],
				sidebar: {
					"/guide": {
						items: [
							{
								title: "Overview",
								collapsed: false,
								items: [
									{
										title: "About",
										link: "/",
									},
									{
										title: "Getting Started",
										link: "/getting-started",
									},
									{
										title: "Examples",
										link: "/examples",
									},
								],
							},
						],
					},
				},
			},
		},
	),
);
