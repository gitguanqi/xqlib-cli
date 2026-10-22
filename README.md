# xqlib-cli

This is a scaffolding tool for xqlib.

[View Chinese documents](./zh.md)

## Instructions

+ Install scaffolding

```sh
npm install xqlib-cli -g
```

+ View version

```sh
xqlib-cli -v
```

+ View information

```sh
xqlib-cli -i
```

+ Build library command

```sh
xqlib-cli -l <library name>
```

+ Build umd command

```sh
xqlib-cli -u <umd name>
```

+ Help Center

```sh
xqlib-cli -h
```

## Library names

The name you pass is used as the directory name and as the `name` field of the generated
`package.json`. It must be a valid npm package name: lowercase letters, digits, `.`, `-` or `_`,
starting with a letter or digit, at most 214 characters. Anything containing a path separator is
rejected, so the scaffold never writes outside the current directory.

`-l` and `-u` are mutually exclusive; pass only one of them. Every failure path exits with a
non-zero code, so the command can be used in scripts.

## Templates

+ `-l <name>` generates a webpack library: `index.js` + `lib/index.js`, `webpack.config.js`,
  `babel.config.js`, a jest spec, and an `example/` demo page. `npm test` builds `dist/` first
  and then runs jest.
+ `-u <name>` generates a UMD / ES module library with four committed builds
  (`lib/example.js`, `lib/example.min.js`, `lib/example-esm.js`, `lib/example-esm.min.js`),
  bilingual docs, and a self-checking page suite under `test/`.

Both templates ship a `README.md`, a `zh.md`, and a `.gitignore`.

## Verifying a generated library

```sh
cd <library name>
npm test              # node check
npm run test:browser  # static server for the test/ pages (UMD template)
```

The UMD template's `test/` pages show a visible PASS/FAIL list for the global, CommonJS, AMD and
ES module consumption paths. The ES module page must be opened over HTTP, because browsers block
`type="module"` on `file://` URLs.

## For AI agents

The package ships agent-readable metadata, declared in `package.json` and included in the
published tarball:

+ `llms.txt` (`"llms"`) — compact CLI reference: flags, name rules, exit codes, and what each
  template generates.
+ `skills/xqlib-cli-scaffold/SKILL.md` (`"agents"`) — when to pick `-l` vs `-u`, the order to run
  things in, common failure modes, and a link to `references/templates.md` with the exact
  generated file contracts.

An assistant should load `SKILL.md` before generating a library and use `llms.txt` when it only
needs the command surface. `npm test` asserts that both targets resolve, that they are covered by
the `files` whitelist, and that the flags named in `llms.txt` match `xqlib-cli -h` exactly.

## Development

```sh
npm install
npm test
```

`npm test` runs `node --test` over `tests/*.test.js`. The suite scaffolds both templates into a
temporary directory, asserts the file contract, and executes all four committed builds of the UMD
template inside a `vm` context.

### Commits

Husky installs two hooks on `npm install` (`prepare`):

- `pre-commit` runs `lint-staged`, which syntax-checks staged `*.js` files with `node --check`.
- `commit-msg` runs `commitlint`. Messages must follow Conventional Commits
  (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:`, `revert:`,
  `chore:`), e.g. `feat: support agent metadata`.

Bump `version` in `package.json` before publishing. Follow semver: `patch` for fixes, `minor` for
backward-compatible features, `major` for breaking changes.

## Case

For example, if I want to generate a `test` js library, I can follow the steps below.

```sh
xqlib-cli -l test
```

## ask questions

[submit your question](https://github.com/gitguanqi/xqlib-cli/issues/new)

## Author

[@gitguanqi](https://github.com/gitguanqi)
