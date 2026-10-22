/**
 * Agent 元数据契约测试：llms.txt 与 skills/ 必须能在发布物中解析，
 * 且内容与真实 CLI 参数一致（防止文档漂移成「愿望清单」）。
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const BIN = path.join(ROOT, 'bin', 'xqlib-cli.js');
const PKG = require('../package.json');

/** files 白名单里的目录写法要能覆盖到具体文件 */
function isWhitelisted (rel) {
    return PKG.files.some(function (entry) {
        const norm = entry.replace(/^\.\//, '').replace(/\/+$/, '');
        return rel === norm || rel.indexOf(norm + '/') === 0;
    });
}

function walk (dir, prefix) {
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const rel = prefix ? prefix + '/' + entry.name : entry.name;
        if (entry.isDirectory()) {
            walk(path.join(dir, entry.name), rel).forEach(function (item) {
                out.push(item);
            });
        } else {
            out.push(rel);
        }
    }
    return out.sort();
}

/** 只解析 SKILL.md 顶部的 `---` 块，字段为单行 key: value */
function readFrontmatter (file) {
    const text = fs.readFileSync(file, 'utf8');
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
    assert.ok(match, 'SKILL.md must start with a YAML frontmatter block');
    const fields = {};
    for (const line of match[1].split(/\r?\n/)) {
        const pair = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/);
        if (pair) {
            fields[pair[1]] = pair[2].replace(/^["']|["']$/g, '').trim();
        }
    }
    return { fields: fields, body: text.slice(match[0].length) };
}

test('package.json declares agent metadata that resolves to real files', function () {
    assert.equal(PKG.llms, './llms.txt', 'llms must be a ./ relative path to the root llms.txt');
    assert.equal(PKG.agents, './skills/xqlib-cli-scaffold/SKILL.md');

    for (const field of ['llms', 'agents']) {
        const target = PKG[field];
        assert.ok(target.startsWith('./'), field + ' must start with ./');
        const abs = path.join(ROOT, target.slice(2));
        assert.ok(fs.existsSync(abs), field + ' points to a missing file: ' + target);
        assert.ok(fs.statSync(abs).isFile(), field + ' must point to a file, not a directory');
    }
});

test('every listed file exists and every shipped agent file is whitelisted', function () {
    for (const entry of PKG.files) {
        assert.ok(fs.existsSync(path.join(ROOT, entry)), 'files entry does not exist: ' + entry);
    }

    const shipped = ['llms.txt', PKG.agents.slice(2)];
    const skillDir = path.join(ROOT, 'skills', 'xqlib-cli-scaffold');
    walk(skillDir, 'skills/xqlib-cli-scaffold').forEach(function (rel) {
        shipped.push(rel);
    });

    for (const rel of shipped) {
        assert.ok(isWhitelisted(rel), rel + ' is not covered by the files whitelist');
    }
});

test('llms.txt documents the flags the binary actually accepts', function () {
    const text = fs.readFileSync(path.join(ROOT, 'llms.txt'), 'utf8');

    for (const flag of ['--version', '--info', '--lib', '--umd', '--help']) {
        assert.ok(text.includes(flag), 'llms.txt omits ' + flag);
    }
    assert.ok(text.includes('xqlib-cli'), 'llms.txt must name the package');
    assert.match(text, /^# xqlib-cli/m, 'llms.txt must open with an H1 title');
    assert.match(text, /\bnpx xqlib-cli\b/, 'llms.txt must show the invocation form');

    // 名称规则与互斥规则是对接方最容易踩的约束，必须写明
    assert.match(text, /\[a-z0-9\]/, 'llms.txt must state the name pattern');
    assert.match(text, /mutually exclusive/, 'llms.txt must state that -l and -u are exclusive');
    assert.match(text, /exit/i, 'llms.txt must explain exit codes');
});

test('llms.txt stays a concise agent summary', function () {
    const text = fs.readFileSync(path.join(ROOT, 'llms.txt'), 'utf8');
    const lines = text.split(/\r?\n/).length;
    assert.ok(lines <= 160, 'llms.txt has grown to ' + lines + ' lines; keep it a short summary');
    assert.ok(text.length <= 9000, 'llms.txt is too large for an inline read');
});

test('every flag named in llms.txt matches the flags in the CLI help output', function () {
    const text = fs.readFileSync(path.join(ROOT, 'llms.txt'), 'utf8');
    const declared = new Set(text.match(/--[a-z][a-z-]*/g) || []);

    const help = spawnSync(process.execPath, [BIN, '-h'], { encoding: 'utf8' });
    assert.equal(help.status, 0);
    const implemented = new Set(help.stdout.match(/--[a-z][a-z-]*/g) || []);

    for (const flag of declared) {
        assert.ok(implemented.has(flag), 'llms.txt documents a flag the CLI does not accept: ' + flag);
    }
    for (const flag of implemented) {
        assert.ok(declared.has(flag), 'CLI accepts ' + flag + ' but llms.txt omits it');
    }
});

test('SKILL.md has valid portable frontmatter', function () {
    const { fields, body } = readFrontmatter(path.join(ROOT, 'skills', 'xqlib-cli-scaffold', 'SKILL.md'));

    assert.equal(fields.name, 'xqlib-cli-scaffold', 'skill name must be lowercase and hyphenated');
    assert.match(fields.name, /^[a-z0-9]+(-[a-z0-9]+)*$/, 'skill name must be kebab-case');
    assert.ok(fields.description && fields.description.length >= 60, 'description must state the capability');
    assert.match(fields.description, /[Ll]oad when/, 'description must state when to load the skill');
    assert.ok(fields.name.length <= 64, 'skill name should stay short');
    assert.ok(fields.description.length <= 1024, 'description must fit the skill metadata limit');

    assert.ok(body.trim().length > 400, 'SKILL.md body must carry real integration guidance');
    for (const banned of ['TODO', 'TBD', 'FIXME', 'lorem ipsum']) {
        assert.equal(body.includes(banned), false, 'placeholder left in SKILL.md: ' + banned);
    }
    assert.equal(body.includes('llms.txt\n\n# xqlib-cli'), false, 'SKILL.md must not paste llms.txt wholesale');
});

test('SKILL.md links only to references that ship with the skill', function () {
    const skillDir = path.join(ROOT, 'skills', 'xqlib-cli-scaffold');
    const text = fs.readFileSync(path.join(skillDir, 'SKILL.md'), 'utf8');
    const links = text.match(/\]\((?!https?:)([^)]+)\)/g) || [];
    assert.ok(links.length > 0, 'SKILL.md should link its detailed reference');

    for (const raw of links) {
        const rel = raw.replace(/^\]\(/, '').replace(/\)$/, '').split('#')[0];
        const abs = path.join(skillDir, rel);
        assert.ok(fs.existsSync(abs), 'broken skill reference: ' + rel);
        assert.ok(
            isWhitelisted('skills/xqlib-cli-scaffold/' + rel),
            'reference not shipped by files whitelist: ' + rel
        );
        assert.equal(rel.startsWith('..'), false, 'references must stay inside the skill directory');
    }
});

test('adding agent metadata leaves the CLI entry point untouched', function () {
    assert.equal(PKG.bin['xqlib-cli'], 'bin/xqlib-cli.js', 'bin target must stay stable');
    assert.ok(fs.existsSync(path.join(ROOT, PKG.bin['xqlib-cli'])));
    if (PKG.main) {
        assert.ok(fs.existsSync(path.join(ROOT, PKG.main)), 'declared main must resolve');
    }
    if (PKG.exports) {
        assert.ok(JSON.stringify(PKG.exports).indexOf('bin/xqlib-cli.js') !== -1);
    }

    const res = spawnSync(process.execPath, [BIN, '-v'], { encoding: 'utf8' });
    assert.equal(res.status, 0, 'CLI still runs after the metadata change');
    assert.match(res.stdout, /^xqlib-cli@\d+\.\d+\.\d+/);
});

test('the published tarball carries llms.txt and the skill, but not the tests', function (t) {
    const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    const res = spawnSync(npmCmd, ['pack', '--dry-run', '--json', '--ignore-scripts'], {
        cwd: ROOT,
        encoding: 'utf8',
        shell: process.platform === 'win32'
    });

    if (res.error || res.status !== 0) {
        t.skip('npm pack unavailable: ' + (res.error ? res.error.message : res.stderr));
        return;
    }

    const start = res.stdout.indexOf('[');
    assert.ok(start !== -1, 'npm pack --json produced no JSON: ' + res.stdout.slice(0, 200));
    const manifest = JSON.parse(res.stdout.slice(start))[0];
    if (!Array.isArray(manifest.files)) {
        t.skip('this npm version does not report the packed file list');
        return;
    }

    const packed = manifest.files.map(function (item) { return item.path; });
    for (const required of [
        'llms.txt',
        'skills/xqlib-cli-scaffold/SKILL.md',
        'skills/xqlib-cli-scaffold/references/templates.md',
        'bin/xqlib-cli.js',
        'lib/db.js',
        'zh.md'
    ]) {
        assert.ok(packed.includes(required), 'tarball is missing ' + required);
    }

    const leaked = packed.filter(function (rel) {
        return rel.startsWith('tests/') || rel.startsWith('node_modules/');
    });
    assert.deepEqual(leaked, [], 'tarball must not ship tests or dependencies');
});
