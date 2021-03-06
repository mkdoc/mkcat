# Cat

[![Build Status](https://travis-ci.org/mkdoc/mkcat.svg?v=3)](https://travis-ci.org/mkdoc/mkcat)
[![npm version](http://img.shields.io/npm/v/mkcat.svg?v=3)](https://npmjs.org/package/mkcat)
[![Coverage Status](https://coveralls.io/repos/mkdoc/mkcat/badge.svg?branch=master&service=github&v=3)](https://coveralls.io/github/mkdoc/mkcat?branch=master)

> Load source files

Concatenate `stdin` and documents passed as `files`, buffer into a single markdown document, parse using [commonmark][], convert the parsed AST to newline-delimited JSON.

## Install

```
npm i mkcat --save
```

For the command line interface install [mkdoc][] globally (`npm i -g mkdoc`).

## Usage

Create the stream and write a [commonmark][] document:

```javascript
var cat = require('mkcat')
  , ast = require('mkast');
cat({files: ['README.md']})
  .pipe(ast.stringify({indent: 2}))
  .pipe(process.stdout);
```

## Example

Read files:

```shell
mkcat README.md | mkout
```

Read stdin:

```shell
cat README.md | mkcat | mkout
```

However this is not recommended because file path information is lost which is important for some processing tools.

Concatenate stdin with files:

```shell
cat README.md | mkcat API.md DEVELOPER.md | mkout
```

## Help

```
Usage: mkcat [options] [files...]

  Reads markdown documents.

Options
  -h, --help              Display help and exit
  --version               Print the version and exit

mkcat@1.1.5
```

## API

### cat

```javascript
cat(opts[, cb])
```

Concatenate stdin with files.

Callback takes the form `function(err, result)` where the type of result
will change depending upon the options given.

When none of the `buffer`, `stringify` and `ast` options are given the
the callback is invoked with no result when the serialize stream finishes.

Returns a buffered reader stream.

* `opts` Object processing options.
* `cb` Function callback function.

#### Options

* `files` Array list of files to concatenate.
* `input` Readable input stream to read before files.
* `output` Writable output stream.
* `encoding` String=utf8 character encoding.
* `buffer` Boolean=false callback with `Buffer`.
* `stringify` Boolean=false callback with a `string`.
* `ast` Boolean=false callback with the parsed AST.
* `serialize` Boolean=false pipe to a serialize stream.

## License

MIT

---

Created by [mkdoc](https://github.com/mkdoc/mkdoc) on April 18, 2016

[mkdoc]: https://github.com/mkdoc/mkdoc
[node]: http://nodejs.org
[npm]: http://www.npmjs.org
[commonmark]: http://commonmark.org
[jshint]: http://jshint.com
[jscs]: http://jscs.info

