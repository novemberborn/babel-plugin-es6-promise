# babel-plugin-es6-promise

Babel plugin that rewrites Promise references to [`es6-promise`], but only if
necessary. Tested with Node.js 0.10 and above.

## Installation

```console
$ npm install --save-dev babel-plugin-es6-promise
```

Then add `es6-promise` to your Babel config, like:

```json
{
  "plugins": ["es6-promise"]
}
```

**[`es6-promise`] must be installed separately.**

## Behavior

This plugin rewrites files that reference the `Promise` built-in. It inserts the
following code at the top of each file:

```js
var _Promise = typeof Promise === 'undefined'
  ? require('es6-promise').Promise
  : Promise
```

This means [`es6-promise`] is only loaded when there is no `Promise` built-in
available. Each `Promise` reference is rewritten to `_Promise`.

Note that `require()` is used rather than a ES2015 module import. This may make
it difficult to do further import transforms.

Also note that the `_Promise` variable name in this example is determined by
Babel and may differ depending on your code.

[`es6-promise`]: https://github.com/stefanpenner/es6-promise
