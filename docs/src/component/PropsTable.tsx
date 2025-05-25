import { mdxComponents } from "@kobalte/solidbase/client";
import { createHighlighter } from "shiki";
import type { Documentation } from "solid-docgen";
import { stringifyType } from "solid-docgen/stringify";
import { Dynamic, For, NoHydration } from "solid-js/web";
import "./PropsTable.css";

interface PropsTableProps {
	docgen: Documentation;
}

const highlighter = await createHighlighter({
	themes: ["github-dark", "github-light"],
	langs: ["typescript"],
});

export function PropsTable(props: PropsTableProps) {
	return (
		<>
			<Dynamic component={mdxComponents.h2}>{props.docgen.displayName}</Dynamic>

			<Dynamic component={mdxComponents.table}>
				<thead>
					<tr>
						<th>Prop</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					<For each={Object.entries(props.docgen.props ?? {})}>
						{([propName, propValue]) => (
							<tr>
								<td>
									<Dynamic component={mdxComponents.code}>
										{propName}
										{propValue.required ? "" : "?"}
									</Dynamic>
								</td>
								<td>
									<NoHydration>
										<span class="props-table-type" innerHTML={highlighter.codeToHtml(
											stringifyType(propValue.type) + (propValue.defaultValue ? ` = ${stringifyType(propValue.defaultValue!, "  ", ",")}` : "" ),
											{
												lang: "typescript",
												themes: {
													0: "github-light",
													1: "github-dark",
												},
												defaultColor: "0",
												cssVariablePrefix: "--",
											}
										)}/>
										<br />
									</NoHydration>
									{propValue.description}
								</td>
							</tr>
						)}
					</For>
				</tbody>
			</Dynamic>
		</>
	);
}
