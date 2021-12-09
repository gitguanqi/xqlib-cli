/**
* 生成库文件
*/

// 引入数据
const dbs = require('./db');

// 开始生成
const mkdirs = require('./mkdir');

// 开始操作
function build (libPath) {
    if (libPath) {
        return mkdirs.init(dbs, libPath);
    }
}

module.exports = build;