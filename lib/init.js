const { exec } = require('child_process');
const check = require('./check');
const build = require('./build');

/**
 * 生成标准js库
 * 1.检测名称是否存在 2.创建库文件夹 3.生成配置文件和目录
 * @param {*} name 库名称
 * @param {*} type 模板类型（webpack / umd）
 * @returns {Promise<boolean>} true 表示生成成功
 */
function init (name, type) {
    console.log('\x1B[1;34mTIP:\x1B[90m The library will be generated soon, please wait!');
    return new Promise(function (resolve) {
        if (!name) {
            return resolve(false);
        }
        check(name, function (res) {
            if (res.code !== 200) {
                return resolve(false);
            }
            Promise.resolve()
                .then(function () {
                    return build(name, type);
                })
                .then(function () {
                    resolve(true);
                })
                .catch(function (err) {
                    console.error('\x1b[1;41mError:\x1b[0m \x1B[31m' + (err && err.message ? err.message : err) + '\x1B[39m');
                    resolve(false);
                });
        });
    });
}

module.exports = {
    exec,
    check,
    init,
};
