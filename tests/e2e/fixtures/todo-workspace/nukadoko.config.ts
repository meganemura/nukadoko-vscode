import { defineConfig } from "nukadoko";

// The step files under features/steps/ are copied unchanged from
// examples/todo in the nukadoko repository
// (https://github.com/meganemura/nukadoko), so the README.md and
// docs/spec.md their rationale strings name are that repository's files.
// They stay a real project's steps rather than ones written to match this
// extension's extractor. Nothing here runs a scenario, so the config sets
// no baseURL.
export default defineConfig({});
