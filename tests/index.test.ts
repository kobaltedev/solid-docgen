import fs from "node:fs";
import path, { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { parse } from "../src";

const INPUT_NAME = "input.tsx";
const FIXTURE_ROOT = dirname(fileURLToPath(import.meta.url));

describe("fixtures", () => {
	runFixtures(FIXTURE_ROOT);
});


function runFixtures(fixturePath: string) {
	const fileNames = fs.readdirSync(fixturePath, { withFileTypes: true});

	for (const entry of fileNames) {
		const filePath = join(entry.parentPath, entry.name);

		if (entry.isDirectory()) {
			const relativeFolder = relative(FIXTURE_ROOT, entry.parentPath);

			describe(relativeFolder, () => {
				runFixtures(filePath);
			});
			continue;
		}

		if (!entry.name.endsWith(INPUT_NAME)) {
			continue;
		}

		const fileContent = fs.readFileSync(filePath, "utf8");

		test(entry.parentPath.split(path.sep).pop()!, async () => {
			const result = parse(fileContent);

			await expect(JSON.stringify(result, null, "\t")).toMatchFileSnapshot(join(entry.parentPath, "output.json"));
		});
	}
}