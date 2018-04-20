#!/usr/bin/env node

const multipipe = require('multipipe')
const split = require('split')
const through = require('through2')
const merge = require('merge-stream')
const logUpdate = require('log-update')
const yargs = require('yargs')
const {PassThrough} = require('stream')

const {argv} = yargs
  .option('lines', { alias: 'l', boolean: true })
  .option('words', { alias: 'w', boolean: true })
  .option('chars', { alias: 'm', boolean: true })
  .option('bytes', { alias: 'c', boolean: true })

if (!(argv.lines || argv.words || argv.chars || argv.bytes)) {
  argv.lines = true
  argv.words = true
  argv.bytes = true
}

const pipe = (...streams) => multipipe(...streams, { objectMode: true })

const one = () => 1

const countTokens = matcher => () => split(matcher, one)

const countRaw = (countBuf, countStr) => () => through.obj((chunk, enc, cb) => {
  if (Buffer.isBuffer(chunk)) {
    cb(null, countBuf(chunk))
  } else if (typeof chunk === 'string') {
    cb(null, countStr(chunk, enc))
  } else {
    cb(new Error('Unexpected input'))
  }
})

const counters = []
if (argv.lines) {
  counters.push(countTokens(/\r?\n/))
}
if (argv.words) {
  counters.push(countTokens(/\S+/))
}
if (argv.chars) {
  counters.push(countRaw(
    (buf) => buf.toString('utf8').length,
    (str) => str.length
  ))
}
if (argv.bytes) {
  counters.push(countRaw(
    (buf) => buf.length,
    (str, enc) => Buffer.byteLength(str, enc)
  ))
}

const totals = counters.map(() => 0)
const outStreams = counters.map((counter, i) =>
  pipe(
    process.stdin,
    PassThrough(),
    counter(),
    through.obj((count, _, cb) => {
      totals[i] += count
      cb(null, true)
    })
  ))

const render = () => {
  logUpdate(totals.join(' '))
}

merge(outStreams)
  .on('data', render)
  .once('end', render)
