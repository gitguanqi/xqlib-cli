const { exec } = require('child_process');
const check = require('./check');
const build = require('./build');

/**
 * 生成标准js库
 * 1.检测名称是否存在 2.创建库文件夹 3.初始化一个npm包 4.安装必须的依赖包 5.生成配置文件和目录 6.生成成功提示
 * @param {*} name 库名称
 */
function init (name, type) {
    console.log('\x1B[1;34mTIP:\x1B[90m The library will be generated soon, please wait!');
    if (name) {
        return check(name, function (res) {  
            if (res.code === 200) {
                return build(name, type);
            }
        });
    }
}

module.exports = {
    exec,
    check,
    init,
};
