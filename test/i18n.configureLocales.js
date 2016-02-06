/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

var i18n = process.env.EXPRESS_COV ? require('../i18n-cov') : require('../i18n'),
  should = require("should"),
  fs = require('fs'),
  path = require('path');

var i18nPath = process.env.EXPRESS_COV ? 'i18n-cov' : 'i18n';
var i18nFilename = path.resolve(i18nPath + '.js');

function reconfigure(config) {
  delete require.cache[i18nFilename];
  i18n = require(i18nFilename);
  i18n.configure(config);
}

describe('locals configuration', function() {

  it('omitting it should read all directory contents', function(done) {
    var directory = path.resolve(__dirname + '/../locales');

    reconfigure({
      directory: directory
    });

    var expected = ['de', 'de-AT', 'de-DE', 'en', 'en-GB', 'en-US', 'fr', 'nl'].sort();
    should.deepEqual(i18n.getLocales(), expected);

    done();
  });

  it('should work when using together with prefix', function(done) {
    var directory = path.resolve(__dirname + '/../testlocales');

    fs.mkdirSync(directory);
    fs.writeFileSync(directory + '/app-de.json', '{}');
    fs.writeFileSync(directory + '/app-en.json', '{}');

    reconfigure({
      directory: directory,
      prefix: 'app-'
    });

    var expected = ['de', 'en'].sort();
    should.deepEqual(i18n.getLocales(), expected);

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

    reconfigure({
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

    reconfigure({
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