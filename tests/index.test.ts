import fs from "node:fs";
import path, { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { type Documentation, type PropDescriptor, parse } from "../src";
import { stringifyType } from "../src/stringify";

const INPUT_NAME = "input.tsx";
const FIXTURE_ROOT = dirname(fileURLToPath(import.meta.url));

describe("fixtures", () => {
	runFixtures(loadFixtures(FIXTURE_ROOT));
});

type Entries =
	| {
			[key: string]: Entries;
	  }
	| fs.Dirent;

function loadFixtures(fixturePath: string): Entries {
	const fileNames = fs.readdirSync(fixturePath, { withFileTypes: true });

	const entries: Entries = {};

	for (const entry of fileNames) {
		const filePath = join(entry.parentPath, entry.name);

		if (entry.isDirectory()) {
			const relativeFolder = relative(FIXTURE_ROOT, filePath);

			entries[relativeFolder.split(path.sep).pop()!] ??= {};
			entries[relativeFolder.split(path.sep).pop()!] = loadFixtures(filePath);

			continue;
		}

		if (entry.name !== INPUT_NAME) {
			continue;
		}

		return entry;
	}

	return entries;
}

async function runFixtures(fixtures: Entries) {
	if (fixtures instanceof fs.Dirent) {
		const filePath = join(fixtures.parentPath, fixtures.name);

		const fileContent = fs.readFileSync(filePath, "utf8");

		const result = parse(fileContent) as Array<
			Documentation & {
				props?: Record<
					string,
					PropDescriptor & { stringified?: string | string[] }
				>;
			}
		>;

		for (const res of result) {
			for (const key in res.props) {
				if (res.props[key].type.name === "array") {
					res.props[key].stringified = [
						stringifyType(res.props[key].type),
						stringifyType(res.props[key].type, { arrayType: "[]" }),
					];
					continue;
				}

				res.props[key].stringified = stringifyType(res.props[key].type);
			}
		}

		await expect(JSON.stringify(result, null, "\t")).toMatchFileSnapshot(
			join(fixtures.parentPath, "output.json"),
		);
		return;
	}

	for (const key in fixtures) {
		const entry = fixtures[key];

		if (entry instanceof fs.Dirent) {
			test(key, async () => {
				await runFixtures(entry);
			});
			continue;
		}

		describe(key, () => {
			runFixtures(entry);
		});
	}
}
