import { describe, expect, it } from "vitest";
import { readCheckReport } from "../../src/diagnostics/build-diagnostics.js";

describe("readCheckReport", () => {
  it("tags each error and warning finding with its own severity, in report order", () => {
    const report = {
      schema_version: 4,
      command: "check",
      findings: [
        { severity: "error", code: "undefined-step", message: "no step matches", file: "features/todo.feature", line: 3 },
        {
          severity: "warning",
          code: "scenario-without-then",
          message: "has no Then step",
          file: "features/todo.feature",
          line: 2,
        },
      ],
    };

    const reading = readCheckReport(JSON.stringify(report));

    expect(reading.kind === "report" && reading.entries).toEqual([
      {
        file: "features/todo.feature",
        line: 3,
        message: "no step matches",
        severity: "error",
        code: "undefined-step",
      },
      {
        file: "features/todo.feature",
        line: 2,
        message: "has no Then step",
        severity: "warning",
        code: "scenario-without-then",
      },
    ]);
  });

  it("shows a refusal as an error and leaves a note out", () => {
    const report = {
      findings: [
        { severity: "refused", code: "config-key-removed", message: "baseURL was removed" },
        { severity: "note", code: "pattern-unbound", message: "no feature line binds it", file: "features/steps/x.ts" },
      ],
    };

    const reading = readCheckReport(JSON.stringify(report));

    expect(reading.kind === "report" && reading.entries).toEqual([
      { file: "", line: undefined, message: "baseURL was removed", severity: "error", code: "config-key-removed" },
    ]);
  });

  it("keeps a finding that has no file, using an empty string rather than dropping it", () => {
    const report = {
      findings: [{ severity: "error", code: "features-dir-missing", message: "featuresDir does not exist" }],
    };

    const reading = readCheckReport(JSON.stringify(report));

    expect(reading.kind === "report" && reading.entries).toEqual([
      { file: "", line: undefined, message: "featuresDir does not exist", severity: "error", code: "features-dir-missing" },
    ]);
  });

  it("keeps a finding that has a file but no line", () => {
    const report = {
      findings: [{ severity: "error", code: "feature-parse-error", message: "Parser errors", file: "features/broken.feature" }],
    };

    const reading = readCheckReport(JSON.stringify(report));

    expect(reading.kind === "report" && reading.entries).toEqual([
      {
        file: "features/broken.feature",
        line: undefined,
        message: "Parser errors",
        severity: "error",
        code: "feature-parse-error",
      },
    ]);
  });

  it("reads a clean report as no entries", () => {
    const reading = readCheckReport(JSON.stringify({ findings: [] }));
    expect(reading).toEqual({ kind: "report", entries: [] });
  });

  it("names the first line of output that is not a report", () => {
    const reading = readCheckReport('noisy-step loaded\n{\n  "findings": []\n}\n');
    expect(reading).toEqual({ kind: "unreadable", firstLine: "noisy-step loaded" });
  });

  it("reads JSON without a findings array as unreadable", () => {
    expect(readCheckReport('{"errors":[],"warnings":[]}')).toEqual({
      kind: "unreadable",
      firstLine: '{"errors":[],"warnings":[]}',
    });
  });

  it("reads output that is empty or only whitespace as empty", () => {
    expect(readCheckReport(" \n\t\n")).toEqual({ kind: "empty" });
  });
});
