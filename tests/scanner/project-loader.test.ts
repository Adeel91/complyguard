import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { loadProject } from "@/scanner/core/project-loader";

describe("project loader", () => {
  it("loads source files from a JavaScript project without tsconfig", () => {
    const directory = mkdtempSync(join(tmpdir(), "complyguard-test-"));

    writeFileSync(
      join(directory, "example.js"),
      "export const value = 42;",
      "utf8",
    );

    const loaded = loadProject(directory);

    expect(loaded.project.getSourceFiles().length).toBe(1);
  });
});
