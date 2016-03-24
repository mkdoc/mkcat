var through = require('through3')
  , PassThrough = through.passthrough()
  , ast = require('mkast')
  , Node = ast.Node
  , Serialize = require('mkast/lib/serialize')
  , Walk = require('mkast/lib/walk')
  , fs = require('fs');

/**
 *  Read a file.
 *
 *  @private {function} read
 */
function read(chunk, encoding, cb) {
  return fs.readFile(chunk, function(err, buf) {
    cb(err, buf);
  })
}

function Concat(opts) {
  opts = opts || {};
  this.isBuffered = opts.isBuffered;
}

/**
 *  Pass through buffers and iterate arrays into files.
 *
 *  @private {function} concat
 */
function concat(chunk, encoding, cb) {
  var scope = this
    , files
    , buffer = this.isBuffered;

  function next() {
    var file = files.shift(); 
    if(!file) {
      return cb();
    }

    read(file, encoding, function(err, buf) {
      if(err) {
        return cb(err); 
      }

      // just wants buffer data
      if(buffer) {
        scope.push(buf);
        return next();
      }

      var doc = ast.parse('' + buf);
      doc.file = file;
      scope.push(doc);
      next();
    })
  }

  // pass through stdin
  if(Buffer.isBuffer(chunk)) {
    this.push(chunk); 
    return cb();
  // send on file chunks to be read
  }else if(Array.isArray(chunk)) {
    files = chunk.slice();
    return next();
  }
  //cb();
}

var ConcatStream = through.transform(concat, {ctor: Concat})
  , BufferedStream = through.transform(cork, flush, {ctor: BufferedReader});

/**
 *  Concatenate stdin with files.
 *
 *  Callback takes the form `function(err, result)` where the type of result 
 *  will change depending upon the options given.
 *
 *  When none of the `buffer`, `stringify` and `ast` options are given the 
 *  the callback is invoked with no result when the serialize stream finishes.
 *
 *  @function cat
 *  @param {Object} opts processing options.
 *  @param {Function} [cb] callback function.
 *
 *  @option {Array} files list of files to concatenate.
 *  @option {Readable} [input] input stream to read before files.
 *  @option {Writable} output output stream.
 *  @option {String=utf8} encoding character encoding.
 *  @option {Boolean=false} buffer callback with `Buffer`.
 *  @option {Boolean=false} stringify callback with a `string`.
 *  @option {Boolean=false} ast callback with the parsed AST.
 *  @option {Boolean=false} serialize pipe to a serialize stream.
 *
 *  @returns a buffered reader stream.
 */
function cat(opts, cb) {
  opts = opts || {};

  var input = opts.input
    , files = opts.files || []
    , called = false
    , output
    , isBuffered = opts.buffer || opts.stringify || opts.ast
    , buf = isBuffered ? new BufferedStream() : new PassThrough()
    , walker = new Walk();


  opts.isBuffered = isBuffered;
  output = new ConcatStream(opts)

  function done(err, res) {
    if(!called && typeof cb === 'function') {
      return cb(err || null, res); 
    } 
    called = true;
  }

  if(opts.serialize) {
    buf = new Serialize(); 
  }

  if(isBuffered) {
    output.pipe(buf);
  }else{
    output.pipe(walker).pipe(buf);
  }

  if(opts.output) {
    buf.pipe(opts.output); 
  }

  output.once('error', done);
  buf.once('error', done);

  buf.once('finish', function() {
    var res = this.buffer
      , str;

    if(isBuffered) {
      // consumer wants the buffer
      if(opts.buffer) {
        return done(null, res); 
      }
      
      str = res.toString(opts.encoding);
      // consumer wants the string
      if(opts.stringify) {
        return done(null, str); 
      }

      // consumer wants the ast
      if(opts.ast) {
        return done(null, ast.parse(str)); 
      }
    }

    done();
  });

  // read from input stream, eg: stdin
  if(input) {
    var bytes = 0
      , stdinput = new Buffer(0);

    input.once('error', done);
    input.on('readable', function(size) {
      var data = input.read(size);
      if(data === null) {

        if(!isBuffered && stdinput.length) {
          var doc = ast.parse('' + stdinput);
          doc.stdin = true;
          walker.write(doc);
          walker.write(Node.createNode(Node.EOF, {stdin: true}));
        }

        // emit an event so cli can respond
        buf.emit('stdin', bytes, files);

        // now concat files
        output.end(files); 
      }else{
        bytes += data.length;
        if(isBuffered) {
          output.write(data); 
        }else{
          stdinput = Buffer.concat(
            [stdinput, data], stdinput.length + data.length);
        }
      }
    })

  }else{
    output.end(files); 
  }

  return buf;
}

/**
 *  Buffers a stream.
 *
 *  @private {constructor} BufferedReader
 */
function BufferedReader() {
  this.buffer = new Buffer(0);
}

/**
 *  Concatenate onto the buffer.
 *
 *  @private {function} cork
 */
function cork(chunk, encoding, cb) {
  this.buffer = Buffer.concat(
    [this.buffer, chunk], this.buffer.length + chunk.length);
  cb();
}

/**
 *  Flush the stream buffer.
 *
 *  @private {function} flush
 */
function flush(cb) {
  this.push(this.buffer);
  cb();
}

module.exports = cat;
