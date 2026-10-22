---
name: xqlib-cli-scaffold
description: Scaffold a JavaScript library project with the xqlib-cli command, either the webpack UMD bundle template or the UMD + ES module twin-build template. Load when creating a new JS library from scratch, choosing between the two templates, or verifying a project xqlib-cli generated.
---

# Scaffolding libraries with xqlib-cli

`xqlib-cli` is a command-line generator. It writes a complete npm package into
`./<name>` and then exits; it never installs dependencies, builds, or publishes.
Drive it with `npx xqlib-cli` (or the globally installed `xqlib-cli` binary) and read
the exit code rather than the log text.

## Choose the template first

| Need | Flag | Result |
| --- | --- | --- |
| Source shipped as source + a webpack bundle, jest tests, babel pipeline | `-l <name>` | `dist/mytest.js` produced by `npm run build` |
| A library that is published as-is, consumable by `<script>`, CommonJS, AMD and ES `import` with no build step | `-u <name>` | four committed builds in `lib/` |

Pick `-u` when the deliverable must be usable directly from a CDN or by an ES-module
consumer without a bundler. Pick `-l` when the consumer already bundles, or when the
project needs a webpack/babel/jest toolchain to develop in.

## Command order

1. Confirm the target directory does not exist. `xqlib-cli` refuses an existing path and
   exits 1, so it is safe to retry after a failure, but it will not repair a partial tree —
   delete the failed directory yourself before retrying.
2. Run exactly one of `-l` / `-u` with a lowercase name:
   `npx xqlib-cli -u my-lib`. The name becomes both the directory and `package.json#name`.
3. Check the exit code (`0` success, `1` failure). Failures print `Error: ...` on stderr.
4. `cd <name>` and run the verification for that template.

Do not pass both flags: `-l` and `-u` are mutually exclusive and produce exit 1 with no files
written.

## Name constraints

The name must match `^[a-z0-9][a-z0-9._-]*$`, be at most 214 characters, and start with a
letter or digit. Uppercase, spaces, a leading dot, and path separators are rejected before
anything is written — the scaffold can never escape the current directory. Scoped names
(`@scope/name`) are not supported.

## Verify what was generated

- UMD template: `npm test` runs `node test/node.js`, which asserts over both the readable and
  the minified build and prints PASS/FAIL lines. `npm run test:browser` serves `test/` on
  `http://localhost:4001` (override with `PORT` / `HOST`) so the ES-module page can load — open
  `/test/` over HTTP, not `file://`.
- webpack template: `npm install && npm run build && npm test`. `pretest` rebuilds `dist/` before
  jest runs, so a jest failure can also mean a webpack failure; run `npm run build` alone to
  separate the two.
- Treat a missing `dist/mytest.js` (webpack template) or a missing `lib/example*.js` (UMD
  template) as a failed scaffold, not as a build problem.

## Non-obvious constraints

- `jquery` is declared external in the webpack template, so the library expects a global
  `jQuery` at runtime and `example/browser.html` loads it from a CDN. Do not add jQuery to the
  bundle without also removing the `externals` entry.
- Generated projects do not depend on `xqlib-cli`; it is a one-shot generator.
- Both templates ship `README.md`, `zh.md`, and `.gitignore`; keep them in sync when you rename
  the library, because the docs reference the generated name.

## Reference

Exact file contracts, entry points, script names, and the generated library API for both
templates are in [references/templates.md](references/templates.md). Read it before asserting on
a generated tree or editing template output.
