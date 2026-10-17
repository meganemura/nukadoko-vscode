// Responsibility: prove this package's own static resolution
// (buildStepIndex, the same function src/extension.ts's real workspace file
// source feeds) names the same vocabulary the CLI's own `nuka steps --json`
// does, against the steps of one real project (nukadoko's examples/todo,
// copied into tests/e2e/fixtures/todo-workspace). Nothing
// under src/ imports the CLI -- this file is the one place in this whole
// package allowed to, since the comparison itself only exists inside a
// test.
import { execFile } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { buildStepIndex, type FileSource } from "../../src/index/index.js";

const execFileAsync = promisify(execFile);

const here = path.dirname(fileURLToPath(import.meta.url));
const cliPath = path.join(here, "..", "..", "node_modules", "nukadoko", "dist", "cli.js");
const todoDir = path.join(here, "fixtures", "todo-workspace");
const todoStepsDir = path.join(todoDir, "features", "steps");

interface StepSummary {
  readonly kind: "typed" | "compat";
  readonly patterns: readonly string[];
}

interface StepsReport {
  readonly steps: readonly StepSummary[];
}

async function listTsFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listTsFiles(fullPath)));
    } else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) {
      files.push(fullPath);
    }
  }
  return files;
}

function realFileSource(filePaths: readonly string[]): FileSource {
  return {
    async listFiles() {
      return filePaths;
    },
    async readFile(filePath) {
      return readFile(filePath, "utf8");
    },
  };
}

describe("vocabulary cross-check: the todo example's steps", () => {
  it(
    "the extension's static resolution names the same typed patterns as `nuka steps --json`",
    async () => {
      const { stdout, stderr } = await execFileAsync(process.execPath, [cliPath, "steps", "--json"], {
        cwd: todoDir,
      });
      expect(stderr).toBe("");
      const report = JSON.parse(stdout) as StepsReport;
      const cliPatterns = new Set(
        report.steps.filter((step) => step.kind === "typed").flatMap((step) => step.patterns),
      );
      // The todo example is chosen precisely because it has no compat
      // steps (the compat door is a separate migration surface). Asserting
      // that here as a precondition, rather than only filtering by kind
      // above, means a future fixture change that adds one gets
      // caught as a test failure instead of silently narrowing what this
      // test actually compares.
      expect(report.steps.every((step) => step.kind === "typed")).toBe(true);
      expect(cliPatterns.size).toBeGreaterThan(0);

      const stepFiles = await listTsFiles(todoStepsDir);
      const index = await buildStepIndex(realFileSource(stepFiles));
      expect(index.unresolved).toEqual([]);
      const extractedPatterns = new Set(
        index.patterns.filter((pattern) => pattern.kind === "typed").map((pattern) => pattern.pattern as string),
      );

      expect([...extractedPatterns].sort()).toEqual([...cliPatterns].sort());
    },
    60_000,
  );
});
