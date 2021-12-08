#!/usr/bin/env node

// 引入commander
const { exec } = require('child_process');
const { program } = require('commander');
const fs = require('fs');

// 添加版本
program
.option('-v, --version', 'show version')
.option('-l, --lib <name>', 'init a lib');

program.parse(process.argv);

const options = program.opts();
if (options.version) {
    console.log('1.0.1');
}
if (options.lib) {
    let name = options.lib;
    console.log('A jslib will be generated soon.');
    return initLib(name);
}

/**
 * 生成标准js库
 * 1.检测名称是否存在 2.创建库文件夹 3.初始化一个npm包 4.安装必须的依赖包 5.生成配置文件和目录 6.生成成功提示
 * @param {*} name 库名称
 */
function initLib (name) {
    console.log('[1/4] Process: Start generating template library.');
    let libPath = name || 'xqcli-template';
    fs.stat(libPath, function (err, stats) {  
        if (err) {
            fs.mkdir(libPath, function (err) {
                if (err) {
                    console.error('[2/4] Error: Failed to create template library folder.');
                } else {
                    console.log('[2/4] Process: The template library folder was created successfully.');
                    console.log('[3/4] Process: Pulling the latest template warehouse, please wait a moment.');
                    exec(`git clone https://github.com/gitguanqi/xqlib-template.git ${name}`, function (err, stdout, stderr) {  
                        if (err) {
                            console.error('[4/4] Error: Failed to pull the latest template warehouse.');
                        } else {
                            console.log('[4/4] Process: The latest template warehouse is successfully pulled.');
                            console.log('congratulations! The js standard library is successfully installed, please run the following command: ');
                            console.log(`  cd ${name}`);
                            console.log('  npm install');
                            console.log('  webpack');
                            console.log('Thank you very much for using this scaffolding to generate the js standard library!');
                        }
                    });
                }
            })
        }
        if (stats) {
            console.error('[1/4] Error: The template library already exists.');
        }
    })
}
