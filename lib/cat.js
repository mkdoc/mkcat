var assert = require('assert')
  , commonmark = require('commonmark')
  , through = require('through3')
  , fs = require('fs');

function transform(chunk, encoding, cb){
  assert(Array.isArray(chunk), 'cat: expects array of files');

  var reader = new commonmark.Parser()
    , doc;

  chunk.forEach(function(file) {
    var contents = fs.readFileSync(file)
      , ast = reader.parse('' + contents);
    if(!doc) {
      doc = ast;
    }else{
      var walker = ast.walker();
      var event, node;
      while ((event = walker.next())) {
        node = event.node;
        if(event.entering && node.parent === ast) {
          doc.appendChild(node);
        }
      }
    }
  })
  this.push(doc);
  cb();
}

module.exports = through.transform(transform);
