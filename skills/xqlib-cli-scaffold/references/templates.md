# Generated project contracts

Both templates are written into `./<name>` relative to the working directory, one file per node,
in the order the template declares. Nothing is overwritten: the target directory must not exist.

## UMD + ES module template (`-u <name>`)

Files, exactly:

```text
.gitignore
README.md
package.json
zh.md
lib/example.js           UMD factory, readable, global `example`
lib/example.min.js       same factory, minified
lib/example-esm.js       `export default example`
lib/example-esm.min.js   minified ES module
test/index.html          link list to the other pages
test/browser.html        global `<script>` path
test/amd.html            AMD path
test/amd.js              AMD shim used by amd.html
test/esm.html            `type="module"` path (needs HTTP)
test/node.js             CommonJS assertions
test/server.js           zero-dependency static server
test/assets/check.js     PASS/FAIL renderer used by the pages
test/assets/demo.css
test/assets/icon.svg
```

`package.json` of the generated project:

- `main`: `lib/example.js`, `module`: `lib/example-esm.js`, `unpkg`: `lib/example.min.js`
- `files`: `lib`, `test`, `README.md`, `zh.md`
- scripts: `test` -> `node test/node.js`, `test:browser` -> `node test/server.js`
- no dependencies, no build step; the committed builds are the artifact

Generated library API (identical in all four builds):

| Member | Type | Behavior |
| --- | --- | --- |
| `name` | `string` | always `'example'` until you rename it |
| `add(a, b)` | `(number, number) => number` | returns `a + b` |
| `sayHi(name)` | `(name) => void` | `console.log(name)`, returns `undefined` |

`test/node.js` asserts both `add` correctness and that the minified build exposes the same keys,
so editing only the readable build breaks `npm test`. `test/server.js` redirects `/` to `/test/`,
defaults to `localhost:4001`, honors `HOST` / `PORT`, and refuses paths outside the project and
anything under `node_modules`.

## webpack template (`-l <name>`)

Files, exactly:

```text
.gitignore
README.md
package.json
add.test.js
babel.config.js
example/browser.html
example/node.js
index.js
lib/index.js
webpack.config.js
```

`package.json` of the generated project:

- `main`: `./dist/mytest.js`
- scripts: `build` -> `webpack`, `pretest` -> `webpack`, `test` -> `jest`
- dependencies cover webpack 5, webpack-cli 4, babel 7, jest 27, jquery 3, eslint 8,
  clean-webpack-plugin 4, terser-webpack-plugin 5

`webpack.config.js` facts that change integration:

- `entry` is `./index.js`; output is `dist/mytest.js`, `libraryTarget: 'umd'`, `library: 'mytest'`,
  `globalObject: 'this'`
- `externals: { jquery: 'jQuery' }` — the bundle calls the page-provided global, it does not embed
  jQuery
- `CleanWebpackPlugin` wipes `dist/` on every build, so build output is never stale
- `SourceMapDevToolPlugin` emits `dist/mytest.js.map`

`lib/index.js` exposes `{ addCon, add }`: `add(a, b)` returns `a + b`, `addCon()` writes an `<h1>`
into `#content` through jQuery. The package has no `module` / `unpkg` field, so ES consumers and
CDN users are out of scope for this template.

## Verifying a scaffold

```sh
cd <name>
# UMD
npm test                # node test/node.js, prints PASS/FAIL per check, exit 1 on failure
npm run test:browser    # then open http://localhost:4001/test/ in a browser
# webpack
npm install
npm run build           # must produce dist/mytest.js
npm test                # pretest rebuilds, then jest runs add.test.js
```

The repository's own suite (`npm test` in the CLI repo) already asserts both file lists exactly and
executes all four UMD builds inside a `vm` context, so template edits that change the tree will fail
`tests/templates.test.js` by design.
