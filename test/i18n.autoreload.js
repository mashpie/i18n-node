/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

var i18n = process.env.EXPRESS_COV ? require('../i18n-cov') : require('../i18n'),
  should = require("should"),
  path = require("path"),
  fs = require('fs-extra');

var testScope = {};
var i18nPath = process.env.EXPRESS_COV ? 'i18n-cov' : 'i18n';
var i18nFilename = path.resolve(i18nPath + '.js');
var reconfigure = function(config) {

  // Force reloading of i18n, to reset configuration
  delete require.cache[i18nFilename];
  i18n = require(i18nFilename);
  i18n.configure(config);
};

describe('Autoreload config', function() {

  beforeEach(function() {
    fs.copySync('./locales', './testlocales');
  });

  afterEach(function() {
    fs.removeSync('./testlocales');
  });

  it('using defaults should add new phrase without reloading files', function() {
    reconfigure({
      locales: ['en', 'de'],
      register: testScope,
      directory: './testlocales',
      autoReload: true
    });

    // quickly ensure default usage
    i18n.setLocale(testScope, 'de');
    should.equal('Hallo', testScope.__('Hello'));
    i18n.setLocale(testScope, 'en');
    should.equal('Hello', testScope.__('Hello'));

    // adds a phrase to catalog (which will write to fs too)
    testScope.__('Hello dear autoreloader');
    var catalog = testScope.getCatalog('en');

    // should be written to catalog
    should.equal(catalog['Hello dear autoreloader'], 'Hello dear autoreloader');

    // should be written to fs too
    var fileContent = JSON.parse(fs.readFileSync('./testlocales/en.json'));
    should.equal(fileContent['Hello dear autoreloader'], 'Hello dear autoreloader');
  });

});