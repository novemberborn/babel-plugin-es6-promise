import assert from 'assert'
import { runInNewContext } from 'vm'

import test from 'ava'
import { transform as babelTransform } from 'babel-core'

import plugin from './'

function transform (code) {
  return babelTransform(code, {
    babelrc: false,
    filename: 'source.js',
    sourceRoot: __dirname,
    plugins: [plugin]
  }).code
}

function run (explicitPromise, es6Promise) {
  const fauxExports = {}
  runInNewContext(
    transform(`
'use strict'

exports.instances = [
  Promise.resolve(),
  new Promise(function () {})
]
exports.constructor = Promise
`),
    {
      exports: fauxExports,
      Promise: explicitPromise,
      require (mid) {
        assert(mid === 'es6-promise')
        return es6Promise
      }
    },
    { filename: 'source.js' }
  )
  return fauxExports
}

test('does not modify programs that do not reference Promise', t => {
  const code = 'function foo() {}'
  t.true(transform(code) === code)
})

test('does not modify member expressions', t => {
  const code = 'exports.Promise = 1;'
  t.true(transform(code) === code)
})

test('does not modify Promise variables', t => {
  const code = 'var Promise = function () {};new Promise();'
  t.true(transform(code) === code)
})

test('does not polyfill Promise unless necessary', t => {
  const result = run(Promise)
  t.true(result.instances[0] instanceof Promise)
  t.true(result.instances[1] instanceof Promise)
  t.true(result.constructor === Promise)
})

test('polyfills Promise when necessary', t => {
  class Faux {
    static resolve () {
      return new Faux()
    }
  }
  const result = run(undefined, { Promise: Faux })
  t.true(result.instances[0] instanceof Faux)
  t.true(result.instances[1] instanceof Faux)
  t.true(result.constructor === Faux)
})
