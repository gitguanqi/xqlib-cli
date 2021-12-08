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

+ 启动生成标准库命令

```sh
xqlib-cli -l <库名称>
```

+ 打包

```sh
webpack
```

+ 测试

```sh
npm test
```

## 案例

比如我想生成一个`test`的js库，可以遵循以下步骤实现。

+ 下载包

```sh
npm install xqlib-cli -g
```

+ 启动生成命令

```sh
# 启动
xqlib-cli -l test

# 结果
A jslib will be generated soon.
[1/4] Process: Start generating template library.
[2/4] Process: The template library folder was created successfully.
[3/4] Process: Pulling the latest template warehouse, please wait a moment.
[4/4] Process: The latest template warehouse is successfully pulled.
congratulations! The js standard library is successfully installed, please run the following command:
  cd test
  npm install
  webpack
Thank you very much for using this scaffolding to generate the js standard library!
```

+ 打包

```sh
webpack
```

## 提问题

[提交问题](https://github.com/gitguanqi/xqsql/issues/new)

## 作者

[@gitguanqi](https://github.com/gitguanqi)
