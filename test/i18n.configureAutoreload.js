/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

var i18n = require('../i18n'),
  should = require("should"),
  fs = require('fs'),
  path = require('path');

var i18nPath = 'i18n';
var i18nFilename = path.resolve(i18nPath + '.js');
var testScope = {};

function reconfigure(config) {
  delete require.cache[i18nFilename];
  i18n = require(i18nFilename);
  i18n.configure(config);
}

describe('autoreload configuration', function() {

  var directory = path.resolve(__dirname + '/../testlocalesauto');

  // @todo: add test on prefixed files
  it('will start with empty catalogs', function(done) {
    fs.mkdirSync(directory);
    fs.writeFileSync(directory + '/de.json', '{}');
    fs.writeFileSync(directory + '/en.json', '{}');
    reconfigure({
      directory: directory,
      register: testScope,
      autoReload: true
    });
    should.deepEqual(i18n.getCatalog(), { de: {}, en: {} });
    setTimeout(function(){
      done();
    }, 50);
  });

  it('reloads when a catalog is altered', function(done) {
    fs.writeFileSync(directory + '/de.json', '{"Hello":"Hallo"}');
    setTimeout(function(){
      done();
    }, 50);
  });

  it('has added new string to catalog and translates correctly', function(done) {
    i18n.setLocale(testScope, 'de');
    should.equal('Hallo', testScope.__('Hello'));
    should.deepEqual(i18n.getCatalog(), { de: { Hello: 'Hallo' }, en: {} });
    done();
  });

  it('will add new string to catalog and files from __()', function(done) {
    should.equal('Hallo', testScope.__('Hello'));
    should.deepEqual(i18n.getCatalog(), { de: { Hello: 'Hallo' }, en: {} });
    done();
  });

  it('will remove testlocalesauto after tests', function(){
    fs.unlinkSync(directory + '/de.json');
    fs.unlinkSync(directory + '/en.json');
    fs.rmdirSync(directory);
  });

});