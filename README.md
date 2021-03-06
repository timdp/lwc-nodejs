# lwc

[![npm](https://img.shields.io/npm/v/@timdp/lwc.svg)](https://www.npmjs.com/package/@timdp/lwc) [![JavaScript Standard Style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](https://standardjs.com/)

A live-updating version of the UNIX [`wc` command](https://en.wikipedia.org/wiki/Wc_(Unix)).

![](demo.gif)

## DEPRECATED

**This Node.js-based version of `lwc` is no longer being maintained. Please
consider using the [Go version](https://github.com/timdp/lwc), which has more
features.**

## Installation

With npm:

```bash
npm install --global @timdp/lwc
```

With Yarn:

```bash
yarn global add @timdp/lwc
```

## Usage

```
lwc [OPTION]...
```

Without any options, `lwc` will count the number of lines, words, and bytes
in standard input, and write them to standard output. Contrary to `wc`, it will
also update standard output while it is still counting.

The following [`wc` options](https://en.wikipedia.org/wiki/Wc_(Unix)) are
currently supported:

- `--lines` or `-l`
- `--words` or `-w`
- `--chars` or `-m`
- `--bytes` or `-c`

## Examples

Count the number of lines in a big file:

```bash
lwc --lines < big-file
```

Run a slow command and count the number of bytes logged:

```bash
slow-command | lwc --bytes
```

## TODO

- Accept file paths in addition to stdin
- Support `--help`
- Support `--max-line-length`
- Support `--files0-from`
- Add tests

## Author

[Tim De Pauw](https://tmdpw.eu/)

## License

MIT
