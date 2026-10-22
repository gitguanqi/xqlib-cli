# xqlib-cli

这是xqlib的脚手架工具。

[查看英文文档](./README.md)

## 简介

本脚手架可以生成一个较为标准的jslib模板库。

## 使用方法

+ 安装脚手架

```sh
npm install xqlib-cli -g
```

+ 查看版本

```sh
xqlib-cli -v
```

+ 查看信息

```sh
xqlib-cli -i
```

+ 构建库命令

```sh
xqlib-cli -l <库名称>
```

+ 构建umd模块

```sh
xqlib-cli -u <库名称>
```

+ 帮助中心

```sh
xqlib-cli -h
```

## 库名称规则

传入的名称同时用作目录名和生成包 `package.json` 的 `name` 字段，必须是合法的 npm 包名：
小写字母、数字、`.`、`-`、`_`，且以字母或数字开头，最长 214 个字符。含路径分隔符的名称会被
直接拒绝，脚手架不会写到当前目录之外。

`-l` 与 `-u` 互斥，只能传其中一个。所有失败路径都会以非 0 退出码结束，可以直接放进脚本使用。

## 模板

+ `-l <库名称>` 生成 webpack 库：`index.js` + `lib/index.js`、`webpack.config.js`、
  `babel.config.js`、jest 用例，以及 `example/` 演示页。`npm test` 会先构建 `dist/` 再跑 jest。
+ `-u <库名称>` 生成 UMD / ES 模块库：四份提交的产物（`lib/example.js`、
  `lib/example.min.js`、`lib/example-esm.js`、`lib/example-esm.min.js`）、中英双语文档，以及
  `test/` 下的自检页面套件。

两个模板都会生成 `README.md`、`zh.md` 和 `.gitignore`。

## 验证生成的库

```sh
cd <库名称>
npm test              # node 端检查
npm run test:browser  # 启动静态服务器查看 test/ 页面（UMD 模板）
```

UMD 模板的 `test/` 页面会把全局、CommonJS、AMD、ES 模块四种消费路径的 PASS/FAIL 直接显示在
页面上。ES 模块页面必须经 HTTP 打开，浏览器在 `file://` 下会拦截 `type="module"`。

## 给 AI 助手用的元数据

本包在 `package.json` 里声明了面向 AI 助手的元数据，并随发布包一起分发：

+ `llms.txt`（`"llms"`）——精简命令参考：参数、库名规则、退出码、两个模板各自的产物。
+ `skills/xqlib-cli-scaffold/SKILL.md`（`"agents"`）——何时选 `-l`、何时选 `-u`，执行顺序，
  常见失败原因，并链接到 `references/templates.md` 里逐文件的产物契约。

只关心命令面时读 `llms.txt`；要真正生成并验证一个库时读 `SKILL.md`。
`npm test` 会校验两个元数据目标存在、被 `files` 白名单覆盖，且 `llms.txt` 里写的参数与
`xqlib-cli -h` 的输出完全一致。

## 开发

```sh
npm install
npm test
```

`npm test` 用 `node --test` 跑 `tests/*.test.js`：把两个模板生成到临时目录、校验文件契约，
并在 `vm` 上下文里真正执行 UMD 模板的四份产物。

## 案例

比如我想生成一个`test`的js库，可以遵循以下步骤实现。

```sh
xqlib-cli -l test
```

## 提问题

[提交问题](https://github.com/gitguanqi/xqlib-cli/issues/new)

## 作者

[@gitguanqi](https://github.com/gitguanqi)
