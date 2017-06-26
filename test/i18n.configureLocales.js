var i18n = require('../i18n'),
  should = require("should"),
  fs = require('fs'),
  path = require('path');

describe('locales configuration', function() {

  it('omitting it should read all directory contents', function(done) {
    var directory = path.resolve(__dirname + '/../locales');

    i18n.configure({
      directory: directory
    });

    var expected = ['de', 'de-AT', 'de-DE', 'en', 'en-GB', 'en-US', 'fr', 'nl', 'ru', 'tr-TR'].sort();
    should.deepEqual(i18n.getLocales(), expected);

    done();
  });

  it('should return blank locales if configured locales is not array', function() {
    i18n.configure({
      locales: 'not an array'
    });

    var returnedLocales = i18n.getLocales();
    returnedLocales.length.should.equal(0);
  });

  it('should work when using together with prefix', function(done) {
    var directory = path.resolve(__dirname + '/../testlocales');

    fs.mkdirSync(directory);
    fs.writeFileSync(directory + '/.gitkeepornot', 'just kidding');
    fs.writeFileSync(directory + '/app-de.json', '{}');
    fs.writeFileSync(directory + '/app-en.json', '{}');

    i18n.configure({
      directory: directory,
      prefix: 'app-'
    });

    var expected = ['de', 'en'].sort();
    should.deepEqual(i18n.getLocales(), expected);

    fs.unlinkSync(directory + '/.gitkeepornot');
    fs.unlinkSync(directory + '/app-de.json');
    fs.unlinkSync(directory + '/app-en.json');
    fs.rmdirSync(directory);

    done();
  });

  it('should work when using together with prefix and extension', function(done) {
    var directory = path.resolve(__dirname + '/../testlocales');

    fs.mkdirSync(directory);
    fs.writeFileSync(directory + '/app-de.js', '{}');
    fs.writeFileSync(directory + '/app-en.js', '{}');

    i18n.configure({
      directory: directory,
      prefix: 'app-',
      extension: '.js'
    });

    var expected = ['de', 'en'].sort();
    should.deepEqual(i18n.getLocales(), expected);

    fs.unlinkSync(directory + '/app-de.js');
    fs.unlinkSync(directory + '/app-en.js');
    fs.rmdirSync(directory);

    done();
  });

  it('should ignore unmatching files when using together with prefix and extension', function(done) {
    var directory = path.resolve(__dirname + '/../testlocales');

    fs.mkdirSync(directory);
    fs.writeFileSync(directory + '/app-de.js', '{}');
    fs.writeFileSync(directory + '/app-en.js', '{}');
    fs.writeFileSync(directory + '/web-fr.json', '{}');

    i18n.configure({
      directory: directory,
      prefix: 'app-',
      extension: '.js'
    });

    var expected = ['de', 'en'].sort();
    should.deepEqual(i18n.getLocales(), expected);

    fs.unlinkSync(directory + '/app-de.js');
    fs.unlinkSync(directory + '/app-en.js');
    fs.unlinkSync(directory + '/web-fr.json');
    fs.rmdirSync(directory);

    done();
  });

});
