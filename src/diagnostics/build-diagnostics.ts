// Responsibility: turn `nuka check --json`'s own report shape into a flat
// list a glue layer can turn into vscode.Diagnostic objects, without
// importing "vscode" -- same split as src/index and src/extraction, kept
// runnable under vitest. `CheckFinding`/`CheckReport` are redeclared here
// (matching the --json envelope that nukadoko's docs/spec.md describes)
// rather than imported: nukadoko's package.json "exports" map has no entry
// for that type, so importing it from here would reach past the published
// surface for a shape this file only needs to read as JSON.

interface CheckFinding {
  readonly severity: string;
  readonly code: string;
  readonly message: string;
  readonly file?: string;
  readonly line?: number;
  readonly step?: string;
}

interface CheckReport {
  readonly findings: readonly CheckFinding[];
}

// A refusal (a config that does not load, a removed flag) stops the check
// the way an error does, so it shows as one. A note is advice nuka check
// itself does not fail on, and `failed` belongs to nuka run; neither has a
// diagnostic.
const DIAGNOSTIC_SEVERITY: Readonly<Record<string, "error" | "warning">> = {
  error: "error",
  refused: "error",
  warning: "warning",
};

export interface DiagnosticsEntry {
  /** Empty when the source `CheckFinding` had no `file` (an issue about the
   * whole workspace, not one line of it) -- never dropped, so the glue
   * layer still has something to show for it (this module's own boundary:
   * *how* a file-less issue gets displayed is the glue layer's call, not
   * this one's). */
  readonly file: string;
  /** 1-indexed, straight from `CheckFinding.line` -- never present unless the
   * source finding named one. */
  readonly line?: number;
  readonly message: string;
  readonly severity: "error" | "warning";
  readonly code: string;
}

function toEntry(finding: CheckFinding, severity: "error" | "warning"): DiagnosticsEntry {
  return {
    file: finding.file ?? "",
    line: finding.line,
    message: finding.message,
    severity,
    code: finding.code,
  };
}

/** What the Check command can show for one `nuka check --json` run. A step
 * file runs when `nuka check` imports it, so anything it prints lands on
 * the same stdout as the report; `unreadable` carries the first line of
 * that output, so a user can find which file printed it. */
export type CheckReportReading =
  | { readonly kind: "report"; readonly entries: readonly DiagnosticsEntry[] }
  | { readonly kind: "empty" }
  | { readonly kind: "unreadable"; readonly firstLine: string };

function isCheckReport(value: unknown): value is CheckReport {
  const report = value as Partial<CheckReport> | null;
  return typeof report === "object" && report !== null && Array.isArray(report.findings);
}

/**
 * Turns a `nuka check --json` report's `findings` into one list, each entry
 * tagged with the diagnostic severity its own `severity` maps to. Never
 * filters a finding out for lacking a `file`: a check that silently dropped
 * the one kind of finding it can't point at a line would defeat the purpose
 * of running it at all.
 */
export function readCheckReport(stdout: string): CheckReportReading {
  if (stdout.trim().length === 0) {
    return { kind: "empty" };
  }
  let report: unknown;
  try {
    report = JSON.parse(stdout);
  } catch {
    report = undefined;
  }
  if (!isCheckReport(report)) {
    const firstLine = stdout.split("\n").find((line) => line.trim().length > 0)!;
    return { kind: "unreadable", firstLine: firstLine.trim() };
  }
  const entries: DiagnosticsEntry[] = [];
  for (const finding of report.findings) {
    const severity = DIAGNOSTIC_SEVERITY[finding.severity];
    if (severity !== undefined) {
      entries.push(toEntry(finding, severity));
    }
  }
  return { kind: "report", entries };
}
