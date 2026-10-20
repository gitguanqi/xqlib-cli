/**
 * 产物执行测试：四个构建都不是「只解析」，而是在 vm / ESM 里真跑一遍。
 * 覆盖三条 UMD 装载路径（全局、CommonJS、AMD）与可读↔压缩的一致性。
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const BIN = path.join(ROOT, 'bin', 'xqlib-cli.js');

const UMD_FILES = ['lib/example.js', 'lib/example.min.js'];
const ESM_FILES = ['lib/example-esm.js', 'lib/example-esm.min.js'];
const CASES = [[1, 2], [0, 0], [-3, 5], [0.5, 0.25], [1000000, 1]];

function generate () {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'xqlib-runtime-'));
    const cwd = path.join(root, 'work');
    fs.mkdirSync(cwd);
    const res = spawnSync(process.execPath, [BIN, '-u', 'demo'], { cwd: cwd, encoding: 'utf8' });
    assert.equal(res.status, 0, res.stderr);
    return path.join(cwd, 'demo');
}

const DIR = generate();

function read (rel) {
    return fs.readFileSync(path.join(DIR, rel), 'utf8');
}

// 全局分支：typeof module 不存在、define 不存在 → 挂到 root（顶层 this）
function loadGlobal (rel) {
    const sandbox = {};
    vm.runInNewContext(read(rel), sandbox, { filename: rel });
    return sandbox;
}

// CommonJS 分支
function loadCommonJs (rel) {
    const sandbox = { module: { exports: {} }, exports: {} };
    vm.runInNewContext(read(rel), sandbox, { filename: rel });
    return sandbox.module.exports;
}

// AMD 分支：按 requirejs 2.3.6 的实际行为解析 define 的实参
// （已用真实 requirejs 验证：define 收到工厂求值后的对象也能正确解析）
function loadAmd (rel) {
    let captured = null;
    const define = function () {
        captured = Array.prototype.slice.call(arguments);
    };
    define.amd = {};
    vm.runInNewContext(read(rel), { define: define, console: console }, { filename: rel });
    if (!captured) {
        return undefined;
    }
    const last = captured[captured.length - 1];
    return typeof last === 'function' ? last() : last;
}

function assertLibrary (lib, label) {
    assert.ok(lib, label + ': nothing was exported');
    assert.equal(typeof lib, 'object', label + ': export is not an object');
    assert.equal(lib.name, 'example', label + ': unexpected library name');
    assert.equal(typeof lib.add, 'function', label + ': add is missing');
    assert.equal(typeof lib.sayHi, 'function', label + ': sayHi is missing');
    for (const pair of CASES) {
        assert.equal(lib.add(pair[0], pair[1]), pair[0] + pair[1], label + ': add(' + pair.join(',') + ')');
    }
}

test('readable and minified UMD builds both work through the global branch', function () {
    for (const rel of UMD_FILES) {
        const sandbox = loadGlobal(rel);
        assertLibrary(sandbox.example, rel + ' (global)');
    }
});

test('readable and minified UMD builds both work through CommonJS', function () {
    for (const rel of UMD_FILES) {
        assertLibrary(loadCommonJs(rel), rel + ' (cjs)');
    }
});

test('readable and minified UMD builds both work through AMD', function () {
    for (const rel of UMD_FILES) {
        assertLibrary(loadAmd(rel), rel + ' (amd)');
    }
});

test('readable and minified UMD builds expose exactly the same shape', function () {
    const readable = loadGlobal(UMD_FILES[0]).example;
    const minified = loadGlobal(UMD_FILES[1]).example;
    assert.deepEqual(Object.keys(minified).sort(), Object.keys(readable).sort());
    assert.deepEqual(Object.keys(readable).sort(), ['add', 'name', 'sayHi']);
});

test('both ES module builds import and behave like the UMD builds', async function () {
    const umd = loadGlobal(UMD_FILES[0]).example;
    for (const rel of ESM_FILES) {
        const source = read(rel);
        const url = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(source) + '#' + rel;
        const mod = await import(url);
        assertLibrary(mod.default, rel + ' (esm default)');
        assert.deepEqual(Object.keys(mod.default).sort(), Object.keys(umd).sort(), rel + ': shape drifted from UMD');
        for (const pair of CASES) {
            assert.equal(mod.default.add(pair[0], pair[1]), umd.add(pair[0], pair[1]), rel + ': result differs from UMD');
        }
    }
});

test('the minified builds are actually minified, not copies of the readable ones', function () {
    assert.ok(read('lib/example.min.js').length < read('lib/example.js').length);
    assert.ok(read('lib/example-esm.min.js').length < read('lib/example-esm.js').length);
});
