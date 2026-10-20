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

## Development

```sh
npm install
npm test
```

`npm test` runs `node --test` over `tests/*.test.js`. The suite scaffolds both templates into a
temporary directory, asserts the file contract, and executes all four committed builds of the UMD
template inside a `vm` context.

## Case

For example, if I want to generate a `test` js library, I can follow the steps below.

```sh
xqlib-cli -l test
```

## ask questions

[submit your question](https://github.com/gitguanqi/xqlib-cli/issues/new)

## Author

[@gitguanqi](https://github.com/gitguanqi)
