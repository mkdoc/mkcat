var expect = require('chai').expect
  , cat = require('../../index');

describe('mkcat:', function() {
  var expected = '# Heading (1)\n## Heading (2)\n'

  it('should cat files to buffer', function(done) {
    cat(
      {
        files: ['test/fixtures/heading1.md', 'test/fixtures/heading2.md'],
        buffer: true
      },
      function(err, buf) {
        expect(err).to.eql(null);
        expect(buf).to.be.instanceof(Buffer);
        expect('' + buf).to.eql(expected);
        done(err); 
      });
  });

  it('should cat files to string', function(done) {
    cat(
      {
        files: ['test/fixtures/heading1.md', 'test/fixtures/heading2.md'],
        input: false,
        stringify: true
      },
      function(err, buf) {
        expect(err).to.eql(null);
        expect(buf).to.be.a('string');
        expect('' + buf).to.eql(expected);
        done(err); 
      });
  });

  it('should cat files to ast', function(done) {
    cat(
      {
        files: ['test/fixtures/heading1.md', 'test/fixtures/heading2.md'],
        input: false,
        ast: true
      },
      function(err, buf) {
        expect(err).to.eql(null);
        expect(buf).to.be.an('object');
        expect(buf.type).to.eql('document');
        done(err); 
      });
  });

  it('should cat files to serializer stream', function(done) {
    cat(
      {
        files: ['test/fixtures/heading1.md', 'test/fixtures/heading2.md'],
        input: false
        //output: process.stdout
      },
      function(err) {
        expect(err).to.eql(null);
        done();
      });
  });

});
