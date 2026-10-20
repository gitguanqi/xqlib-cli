/**
 * webpack 模板契约：新脚手架必须能在干净目录里 npm install && npm test 跑通。
 * 这里用静态断言 + 语法校验挡住「配置写错」这一类问题；真正的构建在 temp 目录里跑一次（见报告）。
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

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'xqlib-webpack-'));
const cwd = path.join(root, 'work');
fs.mkdirSync(cwd);
const generated = spawnSync(process.execPath, [BIN, '-l', 'demo'], { cwd: cwd, encoding: 'utf8' });
assert.equal(generated.status, 0, generated.stderr);

const DIR = path.join(cwd, 'demo');
const manifest = JSON.parse(fs.readFileSync(path.join(DIR, 'package.json'), 'utf8'));

function read (rel) {
    return fs.readFileSync(path.join(DIR, rel), 'utf8');
}

test('babel config targets Babel 7 and is a valid config object', function () {
    const source = read('babel.config.js');
    new vm.Script(source, { filename: 'babel.config.js' });

    assert.ok(source.includes('@babel/preset-env'), 'must use the Babel 7 preset package');
    assert.equal(source.includes("'babel-preset-env'"), false, 'the Babel 6 preset package does not exist under Babel 7');
    assert.ok(source.includes('targets:'), 'the preset option is "targets", not "target"');
    assert.equal(/^\s{4}transform:/m.test(source), false, 'Babel 7 rejects an unknown top-level "transform" key');
});

test('dependencies match the Babel 7 config', function () {
    const deps = manifest.dependencies;
    for (const gone of ['babel-core', 'babel-preset-env', 'babel-plugin-add-module-exports']) {
        assert.equal(gone in deps, false, gone + ' should no longer be declared');
    }
    assert.ok('@babel/core' in deps, '@babel/core is required by babel-jest and babel-loader');
    assert.ok('@babel/preset-env' in deps);
});

test('npm test builds dist first, because the test imports it', function () {
    assert.equal(manifest.scripts.pretest, 'webpack');
    assert.equal(manifest.scripts.test, 'jest');
    assert.equal(manifest.scripts.build, 'webpack');

    const spec = read('add.test.js');
    assert.ok(spec.includes("require('./dist/mytest')"), 'the spec still imports the built bundle');
});

test('the demo page loads jQuery before the bundle that expects the global', function () {
    const html = read('example/browser.html');
    const jquery = html.indexOf('jquery-3.6.0.min.js');
    const bundle = html.indexOf('../dist/mytest.js');
    assert.ok(jquery !== -1, 'the demo must load jQuery: the webpack config keeps it external');
    assert.ok(bundle !== -1);
    assert.ok(jquery < bundle, 'jQuery has to be on the page before the external is resolved');
});

test('the webpack config is syntactically valid and keeps the committed contract', function () {
    const source = read('webpack.config.js');
    new vm.Script(source, { filename: 'webpack.config.js' });

    assert.ok(source.includes("entry: './index.js'"));
    assert.ok(source.includes("path.resolve(__dirname, './dist')"), 'output must stay in ./dist');
    assert.ok(source.includes("libraryTarget: 'umd'"), 'the build must stay UMD');
    assert.ok(source.includes("library: 'mytest'"));
    assert.ok(source.includes('externals'), 'jquery stays external; the demo page supplies the global');
});

test('the entry chain still resolves from package.json main to the built bundle', function () {
    assert.equal(manifest.main, './dist/mytest.js');
    assert.equal(manifest.name, 'demo');
    assert.ok(fs.existsSync(path.join(DIR, 'index.js')));
    assert.ok(fs.existsSync(path.join(DIR, 'lib/index.js')));
    assert.ok(read('index.js').includes("require('./lib/index')"));
});

test('README names the package and documents the real build chain', function () {
    const readme = read('README.md');
    assert.match(readme, /^# demo/);
    assert.equal(readme.includes('xqlib-template'), false);
    assert.ok(readme.includes('npm run build'));
    assert.ok(readme.includes('npm test'));
});

test('.gitignore keeps node_modules and dist out of the repository', function () {
    const ignored = read('.gitignore');
    assert.ok(ignored.includes('node_modules/'));
    assert.ok(ignored.includes('dist/'));
});
