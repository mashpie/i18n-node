require('./index');

var Browser = require('zombie'),
  fs = require('fs'),
  should = require('should'),
  DE = new Browser({
    headers: {
      'accept-language': 'de'
    }
  }),
  EN = new Browser({
    headers: {
      'accept-language': 'en'
    }
  });

var file = __dirname + '/locales/en.json';
var content = JSON.parse(fs.readFileSync(file));

describe('autoreload', function() {
  it('should give current translations in EN', function(done) {
    EN.visit('http://localhost:3000/test/', function() {
      should.equal(EN.text('body'), 'Hello');
      done();
    });
  });

  it('should give current translations in DE', function(done) {
    DE.visit('http://localhost:3000/test/', function() {
      should.equal(DE.text('body'), 'Hallo');
      done();
    });
  });

  it('should trigger reload of translations in EN', function(done) {
    content['Hello'] = 'Hi';
    fs.writeFileSync(file, JSON.stringify(content, null, "\t"), "utf8");
    setTimeout(done, 100);
  });

  it('should give updated translations in EN', function(done) {
    EN.visit('http://localhost:3000/test/', function() {
      should.equal(EN.text('body'), 'Hi');
      done();
    });
  });

  it('should still give old translations in DE', function(done) {
    DE.visit('http://localhost:3000/test/', function() {
      should.equal(DE.text('body'), 'Hallo');
      done();
    });
  });

  it('should reset en.json', function(done) {
    content['Hello'] = 'Hello';
    fs.writeFileSync(file, JSON.stringify(content, null, "\t"), "utf8");
    done();
  });
});

