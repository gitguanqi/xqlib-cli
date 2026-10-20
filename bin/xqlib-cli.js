#!/usr/bin/env node

// 引入commander
const { program } = require('commander');

// 获取包信息
const packageInfo = require('../package.json');

// 初始化
const { init } = require('../lib/init');

// npm 包名规则子集：小写字母/数字开头，可含 . _ -，长度不超过 214
const NAME_PATTERN = /^[a-z0-9][a-z0-9._-]*$/;
const MAX_NAME_LENGTH = 214;

/**
 * 校验库名称，避免路径穿越与非法 npm 包名
 * @param {*} name 库名称
 * @returns {string} 空字符串表示合法，否则为错误说明
 */
function validateName (name) {
    if (!name || typeof name !== 'string') {
        return 'Library name is required.';
    }
    if (name.length > MAX_NAME_LENGTH) {
        return 'Library name must be at most ' + MAX_NAME_LENGTH + ' characters.';
    }
    if (!NAME_PATTERN.test(name)) {
        return 'Invalid library name "' + name + '". Use lowercase letters, digits, dot, dash or underscore only, and start with a letter or digit.';
    }
    return '';
}

program
.option('-v, --version', 'show version')
.option('-i, --info', 'show about us')
.option('-l, --lib <name>', 'init a webpack package')
.option('-u, --umd <name>', 'init a umd package');

program.parse(process.argv);

/**
 * 执行命令，返回进程退出码
 * @returns {Promise<number>} 0 表示成功，1 表示失败
 */
async function run () {
    const options = program.opts();

    // 版本与信息是纯查询，打印后直接结束
    if (options.version) {
        console.log(`xqlib-cli@${packageInfo.version}`);
        return 0;
    }
    if (options.info) {
        let info = `name: ${packageInfo.name},
version: ${packageInfo.version},
author: ${packageInfo.author}`;
        console.log(info);
        return 0;
    }

    // -l 与 -u 互斥，避免静默丢弃其中之一
    if (options.lib && options.umd) {
        console.error('\x1b[1;41mError:\x1b[0m \x1B[31m-l/--lib and -u/--umd are mutually exclusive, please pass only one of them.\x1B[39m');
        return 1;
    }

    const name = options.lib || options.umd;
    if (!name) {
        program.help();
    }

    const type = options.lib ? 'webpack' : 'umd';
    const problem = validateName(name);
    if (problem) {
        console.error('\x1b[1;41mError:\x1b[0m \x1B[31m' + problem + '\x1B[39m');
        return 1;
    }

    const ok = await init(name, type);
    return ok ? 0 : 1;
}

run().then(function (code) {
    process.exitCode = code;
}).catch(function (err) {
    console.error('\x1b[1;41mError:\x1b[0m \x1B[31m' + (err && err.message ? err.message : err) + '\x1B[39m');
    process.exitCode = 1;
});
