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
    transform('"use strict";exports.Promise = Promise'),
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
  return fauxExports.Promise
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
  t.true(run(Promise) === Promise)
})

test('polyfills Promise when necessary', t => {
  class Faux {}
  t.true(run(undefined, { Promise: Faux }) === Faux)
})
