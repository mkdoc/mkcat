var commonmark = require('commonmark')
  , through = require('through3')
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

/**
 *  Pass through buffers and iterate arrays into files.
 *
 *  @private {function} concat
 */
function concat(chunk, encoding, cb) {
  var scope = this
    , files;

  function next() {
    var file = files.shift(); 
    if(!file) {
      return cb();
    }

    read(file, encoding, function(err, buf) {
      if(err) {
        return cb(err); 
      }
      scope.push(buf); 
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
  cb();
}

var ConcatStream = through.transform(concat)
  , BufferedStream = through.transform(cork, flush, {ctor: BufferedReader});

/**
 *  Concatenate stdin with files.
 *
 *  @function cat
 *  @param {Object} opts processing options.
 *  @param {Function} cb callback function.
 *
 *  @option {Array} [files] list of files to concatenate.
 *  @option {Readable=process.stdin} [input] input stream.
 *  @option {Writable} [output] output stream.
 *
 *  @returns a buffered reader stream.
 */
function cat(opts, cb) {
  opts = opts || {};

  var input = opts.input !== undefined ? opts.input : process.stdin
    , files = opts.files || []
    , called = false
    , output = new ConcatStream()
    , buf = new BufferedStream();

  function done(err, res) {
    if(!called) {
      return cb(err, res); 
    } 
    called = true;
  }

  output.pipe(buf);

  output.once('error', done);
  buf.once('error', done);

  buf.once('finish', function() {
    var res = this.buffer;

    // consumer wants the buffer
    if(opts.buffer) {
      return done(null, res); 
    }

    var str = res.toString(opts.encoding);

    // consumer wants the string
    if(opts.stringify) {
      return done(null, str); 
    }

    var parser = new commonmark.Parser()
      , ast = parser.parse(str);

    // consumer wants the ast
    if(opts.ast) {
      return done(null, ast); 
    }

    // serialize to a json stream
    var serializer = require('mkast').serialize
      , stream = serializer(ast);

    if(opts.output) {
      stream.pipe(opts.output); 
    }

    done(null, stream);
  });

  // read from input stream, eg: stdin
  if(input) {
    var bytes = 0;

    input.once('error', done);
    input.on('readable', function(size) {
      var data = input.read(size);
      if(data === null) {

        // emit an event so cli can responsd
        buf.emit('stdin', bytes, files);

        // now concat files
        output.end(files); 

      }else{
        bytes += data.length;
        output.write(data); 
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
 *  @public {constructor} BufferedReader
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
