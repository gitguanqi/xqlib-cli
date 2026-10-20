/**
 * 页面契约测试：不执行页面，只验证路径、入口形态与可见状态机是否齐备。
 * 页面真正的执行在浏览器里完成（npm run test:browser），这里挡住的是「路径写错 / 少一个产物」。
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

function generate () {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'xqlib-pages-'));
    const cwd = path.join(root, 'work');
    fs.mkdirSync(cwd);
    const res = spawnSync(process.execPath, [BIN, '-u', 'demo'], { cwd: cwd, encoding: 'utf8' });
    assert.equal(res.status, 0, res.stderr);
    return path.join(cwd, 'demo');
}

const DIR = generate();
const PAGES = ['test/index.html', 'test/browser.html', 'test/esm.html', 'test/amd.html'];

function read (rel) {
    return fs.readFileSync(path.join(DIR, rel), 'utf8');
}

function localRefs (html) {
    const refs = [];
    const pattern = /(?:src|href)="([^"]+)"/g;
    let match;
    while ((match = pattern.exec(html)) !== null) {
        const value = match[1];
        if (/^(https?:|data:|mailto:|#)/.test(value)) {
            continue;
        }
        refs.push(value);
    }
    return refs;
}

test('every local src/href in the test pages resolves to a file that exists', function () {
    for (const page of PAGES) {
        const dir = path.dirname(path.join(DIR, page));
        for (const ref of localRefs(read(page))) {
            const target = path.resolve(dir, ref);
            assert.ok(fs.existsSync(target), page + ' references a missing file: ' + ref);
        }
    }
});

test('each page carries the shared favicon and stylesheet', function () {
    for (const page of PAGES) {
        const html = read(page);
        assert.match(html, /<link rel="icon" href="assets\/icon\.svg"/, page + ' is missing the shared favicon');
        assert.match(html, /<link rel="stylesheet" href="assets\/demo\.css"/, page + ' is missing the shared stylesheet');
    }
});

test('every executable page renders a live check list', function () {
    for (const page of ['test/browser.html', 'test/esm.html', 'test/amd.html']) {
        const html = read(page);
        assert.match(html, /aria-live="polite"/, page + ' is missing the live status region');
        assert.match(html, /id="checks"/, page + ' has no check list mount');
        assert.match(html, /createCheckList\('checks'\)/, page + ' never starts the check list');
        assert.match(html, /runner\.done\(\)/, page + ' never settles the run');
    }
});

test('the index links every executable scenario', function () {
    const html = read('test/index.html');
    for (const target of ['browser.html', 'esm.html', 'amd.html']) {
        assert.ok(html.includes('href="' + target + '"'), 'index.html does not link ' + target);
    }
});

test('the UMD page executes both committed UMD builds', function () {
    const html = read('test/browser.html');
    const readable = html.indexOf('../lib/example.js');
    const minified = html.indexOf('../lib/example.min.js');
    assert.ok(readable !== -1, 'browser.html must load the readable UMD build');
    assert.ok(minified !== -1, 'browser.html must load the minified UMD build');
    assert.ok(readable < minified, 'the readable build must load first so both can be compared');
    assert.ok(html.includes('window.readableExample'), 'browser.html must capture the readable build before it is overwritten');
});

test('the ESM page is a module page that imports both committed ESM builds', function () {
    const html = read('test/esm.html');
    assert.match(html, /<script type="module">/);
    assert.ok(html.includes("from '../lib/example-esm.js'"), 'esm.html must import the readable ESM build');
    assert.ok(html.includes("from '../lib/example-esm.min.js'"), 'esm.html must import the minified ESM build');
    assert.ok(html.includes('dataset.status'), 'esm.html must report a machine-readable status');
});

test('the AMD page loads a pinned requirejs and fails visibly when it cannot', function () {
    const html = read('test/amd.html');
    assert.match(html, /cdn\.bootcdn\.net\/ajax\/libs\/require\.js\/2\.3\.6\/require\.min\.js/);
    assert.ok(html.includes('runner.fail('), 'amd.html must turn a load failure into a visible FAIL');
    const amd = read('test/amd.js');
    assert.match(amd, /^define\(function \(require\)/);
    assert.ok(amd.includes("require('../lib/example')"), 'amd.js must require the committed UMD build');
});

test('the browser checker renders PENDING/PASS/FAIL and a final status', function () {
    const source = read('test/assets/check.js');
    for (const marker of ['PENDING', 'PASS', 'FAIL', 'is-pass', 'is-fail', 'dataset.status']) {
        assert.ok(source.includes(marker), 'check.js is missing ' + marker);
    }
    // 语法必须成立，否则所有页面会静默空白
    new vm.Script(source, { filename: 'check.js' });
});

test('the static server is dependency-free and guards the filesystem', function () {
    const source = read('test/server.js');
    const manifest = JSON.parse(read('package.json'));

    assert.equal(manifest.scripts['test:browser'], 'node test/server.js');
    for (const marker of ['no-store', 'Forbidden', 'node_modules', 'text/javascript', 'image/svg+xml', '/test/']) {
        assert.ok(source.includes(marker), 'server.js is missing ' + marker);
    }
    assert.equal(/require\('live-server'\)/.test(source), false);
    new vm.Script(source, { filename: 'server.js' });
});

test('the package no longer depends on a globally installed live server', function () {
    for (const rel of ['package.json', 'test/server.js', 'README.md', 'zh.md']) {
        assert.equal(read(rel).includes('live-server'), false, rel + ' still mentions live-server');
    }
});

test('every npm command quoted in the docs exists in the generated scripts', function () {
    const manifest = JSON.parse(read('package.json'));
    for (const doc of ['README.md', 'zh.md']) {
        const text = read(doc);
        const used = new Set();
        const pattern = /npm run ([a-z:]+)/g;
        let match;
        while ((match = pattern.exec(text)) !== null) {
            used.add(match[1]);
        }
        if (/npm test/.test(text)) {
            used.add('test');
        }
        for (const script of used) {
            assert.ok(manifest.scripts[script], doc + ' documents "npm run ' + script + '" but package.json has no such script');
        }
    }
});

test('the ES module builds are reachable from the manifest', function () {
    const manifest = JSON.parse(read('package.json'));
    assert.equal(manifest.main, 'lib/example.js');
    assert.equal(manifest.module, 'lib/example-esm.js');
    assert.equal(manifest.unpkg, 'lib/example.min.js');
    assert.ok(Array.isArray(manifest.files) && manifest.files.includes('lib'));
    // 故意不加 exports：lib/example-esm.js 是 .js，Node 会按 CJS 解析并报 SyntaxError
    assert.equal('exports' in manifest, false);
});
