var expect = require('chai').expect
  , cat = require('../../index');

describe('mkcat:', function() {

  it('should cat files to buffer', function(done) {
    cat(
      {files: ['test/fixtures/heading1.md', 'test/fixtures/heading2.md']},
      function(err, buf) {
        expect(buf).to.be.an('object');
        done(err); 
      });
  });

});
