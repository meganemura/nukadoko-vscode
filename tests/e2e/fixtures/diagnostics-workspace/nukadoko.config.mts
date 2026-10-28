import { defineConfig } from "nukadoko";

// Fixture for tests/e2e/diagnostics-command.test.ts: this whole project
// exists to give `nuka check` one error to report (its one feature steps on
// a pattern features/steps/unrelated-step.mts deliberately does not
// define), so that test can confirm the nukadoko.check command really
// spawns `nuka check` and turns its report into a diagnostic. The scenario
// has no Then, so the same line also gets the scenario-without-then warning,
// which shows a warning reaches the editor as one.
//
// .mts, not .ts: this fixture lives in this extension's package, whose
// own package.json has no "type": "module", so a plain .ts file here would
// load as CommonJS and fail to resolve `import ... from "nukadoko"` at all
// (that package publishes only an ESM build). .mts is unambiguous ESM
// regardless of the nearest package.json (nukadoko's own
// src/config/load-config.ts explains the same rule for a real project's
// nukadoko.config.mts).
export default defineConfig({});
