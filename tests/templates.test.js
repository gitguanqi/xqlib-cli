/**
 * 模板契约测试：生成目录必须与「人工维护的期望清单」完全一致。
 * 清单故意写死，不从 lib/db.js 反推，否则模板漏文件时测试会一起漏。
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const BIN = path.join(ROOT, 'bin', 'xqlib-cli.js');
const mkdirs = require('../lib/mkdir');

const UMD_FILES = [
    '.gitignore',
    'README.md',
    'lib/example-esm.js',
    'lib/example-esm.min.js',
    'lib/example.js',
    'lib/example.min.js',
    'package.json',
    'test/amd.html',
    'test/amd.js',
    'test/assets/check.js',
    'test/assets/demo.css',
    'test/assets/icon.svg',
    'test/browser.html',
    'test/esm.html',
    'test/index.html',
    'test/node.js',
    'test/server.js',
    'zh.md'
];

const WEBPACK_FILES = [
    '.gitignore',
    'README.md',
    'add.test.js',
    'babel.config.js',
    'example/browser.html',
    'example/node.js',
    'index.js',
    'lib/index.js',
    'package.json',
    'webpack.config.js'
];

function generate (type, name) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'xqlib-template-'));
    const cwd = path.join(root, 'work');
    fs.mkdirSync(cwd);
    const flag = type === 'umd' ? '-u' : '-l';
    const res = spawnSync(process.execPath, [BIN, flag, name], { cwd: cwd, encoding: 'utf8' });
    assert.equal(res.status, 0, 'cli failed: ' + res.stderr);
    return path.join(cwd, name);
}

function listFiles (dir) {
    const out = [];
    (function walk (current, prefix) {
        for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
            const rel = prefix ? prefix + '/' + entry.name : entry.name;
            if (entry.isDirectory()) {
                walk(path.join(current, entry.name), rel);
            } else {
                out.push(rel);
            }
        }
    })(dir, '');
    return out.sort();
}

test('umd template tree matches the expected manifest exactly', function () {
    const dir = generate('umd', 'demo');
    assert.deepEqual(listFiles(dir), UMD_FILES.slice().sort());
});

test('webpack template tree matches the expected manifest exactly', function () {
    const dir = generate('webpack', 'demo');
    assert.deepEqual(listFiles(dir), WEBPACK_FILES.slice().sort());
});

test('generated package name follows the argument', function () {
    for (const type of ['umd', 'webpack']) {
        const dir = generate(type, 'my-lib');
        const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'));
        assert.equal(manifest.name, 'my-lib', type + ' template must carry the requested name');
    }
});

test('umd template ships bilingual docs that reference the real package name', function () {
    const dir = generate('umd', 'my-lib');
    const readme = fs.readFileSync(path.join(dir, 'README.md'), 'utf8');
    const zh = fs.readFileSync(path.join(dir, 'zh.md'), 'utf8');

    assert.match(readme, /^# my-lib/);
    assert.match(zh, /^# my-lib/);
    assert.ok(readme.includes("require('my-lib')"), 'README install sample must use the real name');
    assert.ok(zh.includes("require('my-lib')"), 'zh install sample must use the real name');

    // 旧文档里的未定义标识符与失效的 ES5 承诺
    for (const doc of [readme, zh]) {
        assert.equal(doc.includes('xqsql'), false, 'stale identifier leaked into docs');
        assert.equal(/[Ee][Ss]5/.test(doc), false, 'builds use const/arrow functions, an ES5 claim would be false');
    }
});

test('every generated text file is valid UTF-8 without replacement characters', function () {
    for (const type of ['umd', 'webpack']) {
        const dir = generate(type, 'demo');
        for (const rel of listFiles(dir)) {
            const buf = fs.readFileSync(path.join(dir, rel));
            const text = buf.toString('utf8');
            assert.equal(text.includes('\uFFFD'), false, 'encoding damaged in ' + rel);
            assert.equal(buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf, false, 'BOM in ' + rel);
        }
    }
});

test('build() is repeatable in one process: no counter accumulation, no appended files', async function () {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'xqlib-repeat-'));
    const cwd = path.join(root, 'work');
    fs.mkdirSync(cwd);
    const previous = process.cwd();
    process.chdir(cwd);
    try {
        // 真实流程里 lib/check.js 先建好库目录，这里照做
        fs.mkdirSync(path.join(cwd, 'demo'));
        const template = [
            { name: 'a.txt', val: 'x' },
            { name: 'dir', child: [{ name: 'b.txt', val: 'y' }] }
        ];

        await mkdirs.init(template, 'demo', 'umd');
        const firstTotal = mkdirs.data.total;
        const firstLog = mkdirs.data.log;

        await mkdirs.init(template, 'demo', 'umd');

        assert.equal(mkdirs.data.total, firstTotal, 'total must not accumulate across runs');
        assert.equal(mkdirs.data.log, firstLog, 'catalogue log must not accumulate across runs');
        assert.equal(fs.readFileSync(path.join(cwd, 'demo', 'a.txt'), 'utf8'), 'x', 'writeFile must not append');
        assert.equal(fs.readFileSync(path.join(cwd, 'demo', 'dir', 'b.txt'), 'utf8'), 'y');
    } finally {
        process.chdir(previous);
    }
});
