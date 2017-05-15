var i18n = require('../i18n'),
  should = require("should"),
  fs = require('fs'),
  path = require('path');

var i18nPath = 'i18n';
var i18nFilename = path.resolve(i18nPath + '.js');
var timeout = 50;

function reconfigure(config) {
  delete require.cache[i18nFilename];
  i18n = require(i18nFilename);
  i18n.configure(config);
}

describe('autoreload configuration', function() {

  var testScope = {};
  var directory = path.resolve(__dirname + '/../testlocalesauto');

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
    setTimeout(done, timeout);
  });

  it('reloads when a catalog is altered', function(done) {
    fs.writeFileSync(directory + '/de.json', '{"Hello":"Hallo"}');
    setTimeout(done, timeout);
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

  it('will remove testlocalesauto after tests', function() {
    fs.unlinkSync(directory + '/de.json');
    fs.unlinkSync(directory + '/en.json');
    fs.rmdirSync(directory);
  });
});

describe('autoreload configuration with prefix', function() {

  var testScope = {};
  var directory = path.resolve(__dirname + '/../testlocalesautoprefixed');

  it('will start with empty catalogs', function(done) {
    fs.mkdirSync(directory);
    fs.writeFileSync(directory + '/customprefix-de.json', '{}');
    fs.writeFileSync(directory + '/customprefix-en.json', '{}');
    reconfigure({
      directory: directory,
      register: testScope,
      prefix: 'customprefix-',
      autoReload: true
    });
    should.deepEqual(i18n.getCatalog(), { de: {}, en: {} });
    setTimeout(done, timeout);
  });

  it('reloads when a catalog is altered', function(done) {
    fs.writeFileSync(directory + '/customprefix-de.json', '{"Hello":"Hallo"}');
    setTimeout(done, timeout);
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

  it('will remove testlocalesautoprefixed after tests', function() {
    fs.unlinkSync(directory + '/customprefix-de.json');
    fs.unlinkSync(directory + '/customprefix-en.json');
    fs.rmdirSync(directory);
  });

});

describe('autoreload configuration with prefix and customextension', function() {

  var testScope = {};
  var directory = path.resolve(__dirname + '/../testlocalesautoprefixedext');

  it('will start with empty catalogs', function(done) {
    fs.mkdirSync(directory);
    fs.writeFileSync(directory + '/customprefix-de.customextension', '{}');
    fs.writeFileSync(directory + '/customprefix-en.customextension', '{}');
    reconfigure({
      directory: directory,
      register: testScope,
      prefix: 'customprefix-',
      extension: '.customextension',
      autoReload: true
    });
    should.deepEqual(i18n.getCatalog(), { de: {}, en: {} });
    setTimeout(done, timeout);
  });

  it('reloads when a catalog is altered', function(done) {
    fs.writeFileSync(directory + '/customprefix-de.customextension', '{"Hello":"Hallo"}');
    setTimeout(done, timeout);
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

  it('will remove testlocalesautoprefixed after tests', function() {
    fs.unlinkSync(directory + '/customprefix-de.customextension');
    fs.unlinkSync(directory + '/customprefix-en.customextension');
    fs.rmdirSync(directory);
  });

});

describe('autoreload configuration with customextension', function() {

  var testScope = {};
  var directory = path.resolve(__dirname + '/../testlocalesautocustomextension');

  it('will start with empty catalogs', function(done) {
    fs.mkdirSync(directory);
    fs.writeFileSync(directory + '/de.customextension', '{}');
    fs.writeFileSync(directory + '/en.customextension', '{}');
    reconfigure({
      directory: directory,
      register: testScope,
      extension: '.customextension',
      autoReload: true
    });
    should.deepEqual(i18n.getCatalog(), { de: {}, en: {} });
    setTimeout(done, timeout);
  });

  it('reloads when a catalog is altered', function(done) {
    fs.writeFileSync(directory + '/de.customextension', '{"Hello":"Hallo"}');
    setTimeout(done, timeout);
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

  it('will remove testlocalesautoprefixed after tests', function() {
    fs.unlinkSync(directory + '/de.customextension');
    fs.unlinkSync(directory + '/en.customextension');
    fs.rmdirSync(directory);
  });

});