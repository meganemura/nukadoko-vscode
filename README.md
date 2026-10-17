# nukadoko for VS Code

A VS Code extension for [nukadoko](https://github.com/meganemura/nukadoko), an agent-first engine that runs Gherkin with typed step contracts.
It highlights `.feature` files, jumps from a step line to its declaration, completes step lines, and shows `nuka check` findings as diagnostics.

## What it does

- **Syntax highlight for `.feature` files.**
  `Feature`, `Background`, `Scenario`, `Scenario Outline`, `Rule`, `Examples`, the `Given`/`When`/`Then`/`And`/`But` keywords, `@tags`, `#` comments, `"""` and ```` ``` ```` doc strings, `| table |` cells, and `<placeholder>` references.
- **Highlight of the capture syntax.**
  The `{key:type}` syntax that nukadoko adds to a step `pattern` string is highlighted inside the string literals of a TypeScript file.
- **Go to definition.**
  From a step line in a `.feature` file, the extension jumps to the `defineStep` or compat `Given`/`When`/`Then` declaration that the step binds to.
  A step that matches more than one declaration offers every match.
- **Completion.**
  While you type a step line, the extension suggests every pattern it can read statically.
  An accepted suggestion inserts the step text with one tab stop for each parameter.
  Each stop starts with a value of the parameter's type (`1` for `{int}`, `"title"` for `{title:string}`), so the line binds before you edit it.
  A custom parameter type gets its name as a hint instead.
- **A warning for a pattern it cannot read statically.**
  A step declaration whose pattern is a variable, a function call, or a template literal with a substitution gets a warning on its own line.
  The extension never guesses such a pattern, so the step has no jump and no completion entry, and the warning makes that visible.
  A step file that the extension cannot read or parse gets a warning on its first line, and the other files stay indexed.
  These warnings appear when the extension activates (a `.feature` file opens, or the `nukadoko: Check` command runs), and they refresh when a step file is saved, created, or deleted.
- **`nukadoko: Check`.**
  This command (in the Command Palette) runs `nuka check --json` in the open workspace and shows its errors and warnings as diagnostics.

The extension reads the same step files that `nuka` loads: `.ts`, `.mts`, `.js`, and `.mjs`, without `.d.ts` and `.d.mts` declaration files.
It skips `node_modules`, `dist`, `out`, `build`, `coverage`, `.next`, `.git`, and `.nukadoko`.

## What it never does

The extension does not run code from the workspace on its own.
Highlighting, Go to definition, completion, and the static warnings read the text of each step file and parse it with tree-sitter.
They never import a step file and never start a process.

The `nukadoko: Check` command is the one exception.
It runs only when you invoke it, never on open or on save.
It runs only the workspace's own `node_modules/.bin/nuka`, and nothing else that the workspace owns.

Static matching does not reimplement nukadoko's matching.
It bundles `resolveStaticPattern` from the `nukadoko/matching` export of the nukadoko version in `package.json`, so a pattern matches here the way it matches in that version of `nuka`.

Reformatting, an outline view, generating a step from a feature line, the callers of a step, running a scenario from the editor, and localization are not in this release.

## Install

The extension is not on a marketplace yet.
Build a `.vsix` and install it from VS Code (Extensions: Install from VSIX...):

```sh
npm ci
npm run package
```

The `nukadoko: Check` command needs nukadoko installed in the workspace, so that `node_modules/.bin/nuka` exists.

## Development

Node 24 or later.

- `npm run build` type-checks with `tsc`, bundles `src/extension.ts` into `dist/extension.js` with esbuild, and copies the tree-sitter `.wasm` files into `dist/wasm/`.
- `npm test` runs the Vitest suite. The end-to-end tests under `tests/e2e/` load `dist/extension.js` against a stub of the `vscode` module, so run `npm run build` first.
- `npm run package` builds and writes the `.vsix` with `vsce`.

`.npmrc` sets `ignore-scripts=true` and `min-release-age=7`: a dependency's install script does not run, and npm resolves no version that is less than a week old.

## License

MIT. See [LICENSE](LICENSE).

---

[Japanese](README.ja.md)
