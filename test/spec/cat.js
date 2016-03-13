var expect = require('chai').expect
  , mkcat = require('../../lib/cat')

describe('mkcat:', function() {

  it('should cat files to ast', function(done) {
    var concat = mkcat();
    concat.on('data', function onData(data) {
      expect(data.type).to.eql('Document');
      expect(data.firstChild.firstChild.literal)
        .to.eql('Heading (1)');
      expect(data.lastChild.firstChild.literal)
        .to.eql('Heading (2)');
    })
    concat.on('finish', function onFinish() {
      done();
    })
    concat.end(
      ['test/fixtures/heading1.md', 'test/fixtures/heading2.md']);
  });

});
