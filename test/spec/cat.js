var expect = require('chai').expect
  , cat = require('../../index');

describe('mkcat:', function() {

  it('should cat files to buffer', function(done) {
    var expected = '# Heading (1)\n## Heading (2)\n'
    cat(
      {files: ['test/fixtures/heading1.md', 'test/fixtures/heading2.md']},
      function(err, buf) {
        expect(err).to.eql(null);
        expect(buf).to.be.an('object');
        expect('' + buf).to.eql(expected);
        done(err); 
      });
  });

});
