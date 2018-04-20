#!/usr/bin/env node

const multipipe = require('multipipe')
const split = require('split')
const through = require('through2')
const merge = require('merge-stream')
const logUpdate = require('log-update')
const yargs = require('yargs')
const {PassThrough} = require('stream')

const reWhitespace = /\s+/
const reNewline = /\r?\n/g

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

const countRaw = (countBuf, countStr) => () => through.obj((chunk, enc, cb) => {
  if (Buffer.isBuffer(chunk)) {
    cb(null, countBuf(chunk))
  } else if (typeof chunk === 'string') {
    cb(null, countStr(chunk, enc))
  } else {
    cb(new Error('Unexpected input'))
  }
})

const countNewlines = () => through.obj((chunk, enc, cb) => {
  let str = null
  if (Buffer.isBuffer(chunk)) {
    str = chunk.toString('utf8')
  } else if (typeof chunk === 'string') {
    str = chunk
  } else {
    cb(new Error('Unexpected input'))
  }
  let count = 0
  while (reNewline.exec(str) != null) {
    ++count
  }
  cb(null, count)
})

const countWords = () => split(reWhitespace, word => (word !== '') ? 1 : 0)

const counters = []
if (argv.lines) {
  counters.push(countNewlines)
}
if (argv.words) {
  counters.push(countWords)
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

const outStream = merge(outStreams)
outStream.once('end', render)
if (process.stdout.isTTY) {
  outStream.on('data', render)
}
outStream.resume()
