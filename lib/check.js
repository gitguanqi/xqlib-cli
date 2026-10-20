/**
 * 检测名称是否存在：
 * 存在提示，不存在创建文件夹
 * 无论成功失败都会回调，调用方据此决定退出码
*/
const fs = require('fs');

function fail (msg, code) {
    console.error('\x1b[1;41mError:\x1b[0m \x1B[31m' + msg + '\x1B[39m');
    return { code: 500, msg: code || 'error' };
}

function check (libPath, cb) {
    fs.stat(libPath, function (err) {
        // 目录已存在：明确报错并把结果交回调用方
        if (!err) {
            return cb(fail('The library name already exists!', 'EEXIST'));
        }
        // 只有「不存在」才继续创建，其余错误（权限等）直接失败
        if (err.code !== 'ENOENT') {
            return cb(fail('Failed to read library folder! (' + err.code + ')', err.code));
        }
        fs.mkdir(libPath, { recursive: true }, function (mkdirErr) {
            if (mkdirErr) {
                return cb(fail('Failed to create library folder! (' + mkdirErr.code + ')', mkdirErr.code));
            }
            console.log('\x1b[1;34mSUCCESS:\x1b[0m \x1B[90m' + 'The library file has been created in ' + libPath + '\x1B[39m');
            cb({ code: 200, msg: 'ok' });
        });
    });
}

module.exports = check;
