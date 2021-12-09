/**
 * 检测名称是否存在：
 * 存在提示，不存在创建文件夹
*/
const fs = require('fs');

function check (libPath, cb) {  
    fs.stat(libPath, (err, stats) => {
        if (err) {
            fs.mkdir(libPath, function (err) {  
                if (err) {
                    return console.error('\x1b[1;41mError:\x1b[0m \x1B[31mFailed to create library folder!\x1B[39m');
                } else {
                    console.log('\x1b[1;34mSUCCESS:\x1b[0m \x1B[90m' + 'The library file has been created in ' + libPath + '\x1B[39m');
                    cb({code: 200, msg: 'ok'});
                }
            })
        }
        if (stats) {
            return console.error('\x1b[1;41mError:\x1b[0m \x1B[31mThe library name already exists!\x1B[39m')
        }
    })
}

module.exports = check;
