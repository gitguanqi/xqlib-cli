# example

This is a example package.

[View Chinese documents](./zh.md)

## Install

**Browser**:

import cdn

```html
<!-- Browser -->
<script src="../lib/example.min.js"></script>
<!-- es module -->
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

## Usage

+ call add

```js
const sum = example.add(1,2);
console.log('sum is:', sum);
// sum is: 3
```

## View example

Run this script to view the demonstration case: `npm run test:node`, `npm run test:browser`.

## ask questions

[submit your question](https://github.com/xxx/example/issues/new)

## Author

[@xxx](https://github.com/xxx)
