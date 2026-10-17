# nukadoko for VS Code

[English](README.md)

[nukadoko](https://github.com/meganemura/nukadoko) のための VS Code 拡張機能。
nukadoko は、型付きの step 契約で Gherkin を実行する、agent を第一の読者とするエンジン。
この拡張機能は `.feature` ファイルをハイライトし、step の行から宣言へジャンプし、step の行を補完し、`nuka check` の結果を診断として表示する。

## できること

- **`.feature` ファイルのシンタックスハイライト。**
  `Feature`、`Background`、`Scenario`、`Scenario Outline`、`Rule`、`Examples`、`Given`/`When`/`Then`/`And`/`But` のキーワード、`@tags`、`#` コメント、`"""` と ```` ``` ```` の doc string、`| table |` のセル、`<placeholder>` の参照をハイライトする。
- **キャプチャ構文のハイライト。**
  nukadoko が step の `pattern` 文字列に加える `{key:type}` 構文を、TypeScript ファイルの文字列リテラルの中でハイライトする。
- **定義へ移動。**
  `.feature` ファイルの step の行から、その step が束ねられる `defineStep` または compat の `Given`/`When`/`Then` の宣言へジャンプする。
  複数の宣言に一致する step では、一致したものをすべて示す。
- **補完。**
  step の行を入力している間、静的に読める pattern をすべて候補に出す。
  候補を確定すると、パラメータごとに 1 つのタブストップを持つ step の文が挿入される。
  各タブストップはパラメータの型に合う値で始まる(`{int}` なら `1`、`{title:string}` なら `"title"`)ので、編集する前から行が束ねられる。
  カスタムのパラメータ型では、値の代わりにその名前がヒントとして入る。
- **静的に読めない pattern への警告。**
  pattern が変数、関数呼び出し、または置換を含むテンプレートリテラルである step の宣言には、その行に警告が付く。
  拡張機能はそうした pattern を推測しないので、その step にはジャンプも補完候補もなく、警告がそれを見えるようにする。
  拡張機能が読み込めない、またはパースできない step ファイルには、先頭行に警告が付き、他のファイルは索引に残る。
  これらの警告は拡張機能が有効になったとき(`.feature` ファイルを開いたとき、または `nukadoko: Check` コマンドを実行したとき)に現れ、step ファイルの保存、作成、削除のたびに更新される。
- **`nukadoko: Check`。**
  このコマンド(コマンドパレットから実行する)は、開いているワークスペースで `nuka check --json` を実行し、そのエラーと警告を診断として表示する。

拡張機能は `nuka` が読み込むのと同じ step ファイルを読む。
対象は `.ts`、`.mts`、`.js`、`.mjs` で、`.d.ts` と `.d.mts` の宣言ファイルは除く。
`node_modules`、`dist`、`out`、`build`、`coverage`、`.next`、`.git`、`.nukadoko` は読まない。

## しないこと

拡張機能は、ワークスペースのコードを自分から実行しない。
ハイライト、定義へ移動、補完、静的な警告は、各 step ファイルのテキストを読んで tree-sitter でパースするだけである。
step ファイルを import することも、プロセスを起動することもない。

`nukadoko: Check` コマンドだけが例外である。
このコマンドは呼び出したときにだけ実行され、ファイルを開いたときや保存したときには実行されない。
実行するのはワークスペース自身の `node_modules/.bin/nuka` だけで、ワークスペースが持つそれ以外のものは実行しない。

静的なマッチングは nukadoko のマッチングを再実装していない。
`package.json` にある nukadoko のバージョンの `nukadoko/matching` から `resolveStaticPattern` をバンドルしているので、pattern はそのバージョンの `nuka` と同じように一致する。

整形、アウトライン表示、feature の行からの step の生成、step の呼び出し元の表示、エディタからの scenario の実行、ローカライズは、このリリースには含まれない。

## インストール

拡張機能はまだマーケットプレイスに公開していない。
`.vsix` をビルドし、VS Code から(Extensions: Install from VSIX...)インストールする。

```sh
npm ci
npm run package
```

`nukadoko: Check` コマンドを使うには、ワークスペースに nukadoko がインストールされ、`node_modules/.bin/nuka` があること。

## 開発

Node 24 以降が必要。

- `npm run build` は `tsc` で型検査し、`src/extension.ts` を esbuild で `dist/extension.js` にバンドルし、tree-sitter の `.wasm` ファイルを `dist/wasm/` にコピーする。
- `npm test` は Vitest のテストを実行する。`tests/e2e/` の end-to-end テストは `vscode` モジュールのスタブに対して `dist/extension.js` を読み込むので、先に `npm run build` を実行する。
- `npm run package` はビルドしてから `vsce` で `.vsix` を書き出す。

`.npmrc` は `ignore-scripts=true` と `min-release-age=7` を設定している。
依存パッケージのインストールスクリプトは実行されず、npm は公開から 1 週間たっていないバージョンを解決しない。

## ライセンス

MIT。[LICENSE](LICENSE) を参照。
