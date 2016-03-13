//var commonmark = require('commonmark')
var through = require('through3')
  , fs = require('fs');

function read(chunk, encoding, cb) {
  return fs.readFile(chunk, function(err, buf) {
    cb(err, buf);
  })
}

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

function cat(opts, cb) {
  opts = opts || {};

  var input = opts.input !== undefined ? opts.input : process.stdin
    , files = opts.files || []
    , called = false
    , output = new cat.Concat()
    , buf = new cat.Buffer();

  function done(err) {
    if(!called) {
      return cb(err); 
    } 
    called = true;
  }

  if(input) {
    input.once('error', done);
  }

  output.pipe(buf);

  if(files) {
    output.end(files); 
  }

  buf.once('finish', function() {
    cb(null, buf.buffer); 
  });

  return output;
}

function BufferedReader() {
  this.buffer = new Buffer(0);
}

function readChunk(chunk, encoding, cb) {
  this.buffer = Buffer.concat(
    [this.buffer, chunk], this.buffer.length + chunk.length);
  cb();
}

function flush(cb) {
  this.push(this.buffer);
  cb();
}

cat.Concat = through.transform(concat);
cat.Buffer = through.transform(readChunk, flush, {ctor: BufferedReader});

module.exports = cat;