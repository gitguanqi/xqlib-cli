const dbs = [
    {
      name: 'example',
      child: [
        {
          name: 'node.js',
          val: `const fegqTestAdd = require('../dist/mytest').add;
console.log(fegqTestAdd(1,2)); // 3`
        },
        {
          name: 'browser.html',
          val: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>browser测试</title>
</head>
<body>
    <h2>fegq-test测试</h2>
    <script src="../dist/mytest.js"></script>
    <script>
        let result = mytest.add(1,2);
        console.log(result); // 3
    </script>
</body>
</html>`
        },
      ]
    },
    {
      name: 'lib',
      child: [
        {
          name: 'index.js',
          val: `const $ = require('jquery');
function addCon () {  
    $('#content').html('<h1>hello</h1>');
}
function add (a,b) {  
    return a+b;
}
const test = {
    addCon,
    add,
}
module.exports = test;`
        },
      ]
    },
    {
      name: 'add.test.js',
      val: 
`const add = require('./dist/mytest').add;
test('adds 1 + 2 to equal 3', () => {
    expect(add(1,2)).toBe(3);
})`
    },
    {
        name: 'babel.config.js',
        val: `module.exports = {
    presets: [
        [
            'babel-preset-env',
            {
                target: {
                    node: 'current',
                }
            }
        ]
    ],
    transform: {},
}`
    },
    {
        name: 'index.js',
        val: `const mytest = require('./lib/index');
module.exports = mytest;
        `
    },
    {
        name: 'package.json',
        val: `{
    "name": "xqlib-cli-test",
    "version": "0.0.1",
    "description": "this is a js lib test package.",
    "main": "./dist/mytest.js",
    "scripts": {
        "test": "jest",
        "build": "webpack"
    },
    "repository": {
        "type": "git",
        "url": "git+https://github.com/xxxx/xxxx.git"
    },
    "keywords": [
        "test"
    ],
    "author": "xxxx",
    "license": "MIT",
    "bugs": {
        "url": "https://github.com/xxxx/xxxx/issues"
    },
    "homepage": "https://github.com/xxxx/xxxx#readme",
    "dependencies": {
        "babel-core": "^6.26.3",
        "babel-jest": "^27.4.2",
        "babel-loader": "^8.2.3",
        "babel-plugin-add-module-exports": "^1.0.4",
        "babel-preset-env": "^1.7.0",
        "clean-webpack-plugin": "^4.0.0",
        "eslint": "^8.3.0",
        "jest": "^27.4.3",
        "jquery": "^3.6.0",
        "terser-webpack-plugin": "^5.2.5",
        "webpack": "^5.64.4",
        "webpack-cli": "^4.9.1"
    }
}`
    },
    {
        name: 'README.md',
        val: `# xqlib-template\n
This is a xqlib-cli template library\n`
    },
    {
        name: 'webpack.config.js',
        val: `// webpack.config.js
const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    mode: 'production', // 环境
    devtool: false,
    entry: './index.js', // 入口文件
    output: {
        path: path.resolve(__dirname, './dist'), // 输出文件夹
        filename: 'mytest.js', // 文件名称
        libraryTarget: 'umd', // 打包方式
        globalObject: 'this', // 全局对象
        library: 'mytest', // 类库名称
    },

    plugins: [
        new CleanWebpackPlugin(), // 清除上一次打包内容
        new webpack.SourceMapDevToolPlugin({
            filename: 'mytest.js.map'
        }),
    ],
    externals: {
        jquery: "jQuery",
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            terserOptions: {
                ecma: undefined,
                parse: {},
                compress: {},
                mangle: true,
                module: false,
                // Deprecated
                output: null,
                format: null,
                toplevel: false,
                nameCache: null,
                ie8: false,
                keep_classnames: undefined,
                keep_fnames: false,
                safari10: false,
            },
        })],
    }
}`
    },
];

module.exports = dbs;