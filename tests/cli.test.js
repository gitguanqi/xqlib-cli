/**
 * CLI 行为测试：退出码、参数互斥、名称校验、幂等
 * 只依赖 node 内置模块，不联网
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const BIN = path.join(ROOT, 'bin', 'xqlib-cli.js');
const PKG = require('../package.json');

function runCli (args, cwd) {
    const result = spawnSync(process.execPath, [BIN].concat(args), { cwd: cwd, encoding: 'utf8' });
    return { status: result.status, stdout: result.stdout || '', stderr: result.stderr || '' };
}

function makeWorkspace () {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'xqlib-cli-'));
    const cwd = path.join(root, 'work');
    fs.mkdirSync(cwd);
    return { root, cwd };
}

test('-v prints the package version and exits 0', function () {
    const ws = makeWorkspace();
    const res = runCli(['-v'], ws.cwd);
    assert.equal(res.status, 0);
    assert.match(res.stdout, new RegExp('xqlib-cli@' + PKG.version.replace(/\./g, '\\.')));
});

test('-i prints name, version and author', function () {
    const ws = makeWorkspace();
    const res = runCli(['-i'], ws.cwd);
    assert.equal(res.status, 0);
    assert.match(res.stdout, /name: xqlib-cli/);
    assert.match(res.stdout, /author:/);
});

test('-h prints usage and exits 0', function () {
    const ws = makeWorkspace();
    const res = runCli(['-h'], ws.cwd);
    assert.equal(res.status, 0);
    assert.match(res.stdout, /--lib/);
    assert.match(res.stdout, /--umd/);
});

test('no arguments prints usage instead of doing nothing', function () {
    const ws = makeWorkspace();
    const res = runCli([], ws.cwd);
    assert.equal(res.status, 0);
    assert.match(res.stdout, /Usage:/);
    assert.deepEqual(fs.readdirSync(ws.cwd), []);
});

test('-l and -u together is rejected', function () {
    const ws = makeWorkspace();
    const res = runCli(['-l', 'aaa', '-u', 'bbb'], ws.cwd);
    assert.equal(res.status, 1);
    assert.match(res.stderr, /mutually exclusive/);
    assert.deepEqual(fs.readdirSync(ws.cwd), []);
});

test('uppercase or spaced names are rejected', function () {
    const ws = makeWorkspace();
    for (const bad of ['Bad-Name', 'has space', '.hidden']) {
        const res = runCli(['-u', bad], ws.cwd);
        assert.equal(res.status, 1, 'expected rejection for ' + bad);
        assert.match(res.stderr, /Invalid library name/);
    }
    assert.deepEqual(fs.readdirSync(ws.cwd), []);
});

test('path traversal in the name is rejected and writes nothing outside cwd', function () {
    const ws = makeWorkspace();
    const res = runCli(['-u', '../escape'], ws.cwd);
    assert.equal(res.status, 1);
    assert.match(res.stderr, /Invalid library name/);
    assert.equal(fs.existsSync(path.join(ws.root, 'escape')), false);
    assert.deepEqual(fs.readdirSync(ws.cwd), []);
});

test('an existing directory is refused with a non-zero exit code', function () {
    const ws = makeWorkspace();
    const first = runCli(['-u', 'demo'], ws.cwd);
    assert.equal(first.status, 0);
    const second = runCli(['-u', 'demo'], ws.cwd);
    assert.equal(second.status, 1);
    assert.match(second.stderr, /already exists/);
});

test('umd template generates the expected tree and a parseable package.json', function () {
    const ws = makeWorkspace();
    const res = runCli(['-u', 'demo'], ws.cwd);
    assert.equal(res.status, 0);

    const dir = path.join(ws.cwd, 'demo');
    for (const rel of [
        'lib/example.js',
        'lib/example.min.js',
        'lib/example-esm.js',
        'lib/example-esm.min.js',
        'test/browser.html',
        'test/esm.html',
        'test/amd.html',
        'test/amd.js',
        'test/node.js',
        'package.json'
    ]) {
        assert.ok(fs.existsSync(path.join(dir, rel)), 'missing ' + rel);
    }

    const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
    assert.equal(typeof manifest.version, 'string');
});

test('webpack template generates the expected tree', function () {
    const ws = makeWorkspace();
    const res = runCli(['-l', 'demo'], ws.cwd);
    assert.equal(res.status, 0);

    const dir = path.join(ws.cwd, 'demo');
    for (const rel of [
        'index.js',
        'lib/index.js',
        'add.test.js',
        'babel.config.js',
        'webpack.config.js',
        'example/browser.html',
        'example/node.js',
        'package.json'
    ]) {
        assert.ok(fs.existsSync(path.join(dir, rel)), 'missing ' + rel);
    }

    const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
    assert.equal(typeof manifest.version, 'string');
});

test('progress output counts every generated node once', function () {
    const ws = makeWorkspace();
    const res = runCli(['-u', 'demo'], ws.cwd);
    assert.equal(res.status, 0);

    const lines = res.stdout.split(/\r?\n/).filter(function (line) {
        return /^\[\d+\/\d+\]/.test(line);
    });
    const total = Number(lines[0].match(/\/(\d+)\]/)[1]);
    assert.equal(lines.length, total, 'one progress line per node');
    assert.match(res.stdout, new RegExp('All package installed ' + total + ' file'));
});
