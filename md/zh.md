# example

这是一个example的工具包

[查看英文文档](./README.md)

## 安装

**游览器端**:

引入cdn

```html
<!-- 游览器es5 -->
<script src="../lib/example.min.js"></script>
<!-- es6模块 -->
<script type="module">
    import example from '../lib/example-esm.min.js';
</script>
```

**Node**:

```sh
npm install example
```

```js
const xqsql = require('example');
```

## 使用

+ 调用add方法

```js
const sum = example.add(1,2);
console.log('sum is:', sum);
// sum is: 3
```

## 查看示例

运行这个脚本查看展示案例：`npm run test:node`, `npm run test:browser`。

## 提问题

[submit your question](https://github.com/xxx/example/issues/new)

## 作者

[@xxx](https://github.com/xxx)
