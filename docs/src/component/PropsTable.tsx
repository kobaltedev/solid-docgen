import { mdxComponents } from "@kobalte/solidbase/client";
import type { Documentation } from "solid-docgen";
import { stringifyType } from "solid-docgen/stringify";
import { Dynamic, For, Show } from "solid-js/web";

interface PropsTableProps {
	docgen: Documentation;
}

export function PropsTable(props: PropsTableProps) {
	return (
		<>
			<Dynamic component={mdxComponents.h2}>{props.docgen.displayName}</Dynamic>

			<Dynamic component={mdxComponents.table}>
				<thead>
					<tr>
						<th>Prop</th>
						<th>Type</th>
						<th>Default</th>
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
									<Dynamic component={mdxComponents.code}>
										{stringifyType(propValue.type)}
									</Dynamic>
								</td>
								<td>
									<Show when={propValue.defaultValue}>
										<Dynamic component={mdxComponents.code}>
											{stringifyType(propValue.defaultValue!, "  ", ",")}
										</Dynamic>
									</Show>
								</td>
								<td>{propValue.description}</td>
							</tr>
						)}
					</For>
				</tbody>
			</Dynamic>
		</>
	);
}
