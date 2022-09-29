#!/usr/bin/env node

// 引入commander
const { program } = require('commander');

// 获取包信息
const package = require('../package.json');

// 初始化
const { init } = require('../lib/init');

// 添加版本
program
.option('-v, --version', 'show version')
.option('-i, --info', 'show about us')
.option('-l, --lib <name>', 'init a webpack package')
.option('-u, --umd <name>', 'init a umd package');

program.parse(process.argv);

const options = program.opts();
if (options.version) {
    console.log(`xqlib-cli@${package.version}`);
}
if (options.info) {
    let info = `name: ${package.name},
version: ${package.version},
author: ${package.author}`;
    console.log(info);
}
if (options.lib) {
    let name = options.lib;
    if (name) {
        return init(name, 'webpack');
    }
}
if (options.umd) {
    let name = options.umd;
    if (name) {
        return init(name, 'umd');
    }
}
