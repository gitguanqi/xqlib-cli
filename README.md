# xqlib-cli

This is a scaffolding tool for xqlib.

[View Chinese documents](./zh.md)

## Introduction

This scaffolding can generate a relatively standard jslib template library.

## Instructions

+ Install scaffolding

```sh
npm install xqlib-cli -g
```

+ Start the standard library command

```sh
xqlib-cli -l <library name>
```

+ Pack

```sh
webpack
```

+ Test

```sh
npm test
```

## Case

For example, if I want to generate a `test` js library, I can follow the steps below.

+ Download package

```sh
npm install xqlib-cli -g
```

+ Start build command

```sh
# start up
xqlib-cli -l test

# result
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

+ Pack

```sh
webpack
```

## ask questions

[submit your question](https://github.com/gitguanqi/xqlib-cli/issues/new)

## Author

[@gitguanqi](https://github.com/gitguanqi)
