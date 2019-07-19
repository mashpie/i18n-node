'use strict';
var i18n = require('../i18n'),
  clear = require('./helpers/clear'),
  should = require('should'),
  fs = require('fs'),
  upath = require('upath'),
  timeout = 300
;
describe('autoreload', function () {
  describe('autoreload configuration', function() {

    var testScope;
    var directory = upath.resolve(upath.join(__dirname, '/../testlocalesauto'));
  
    before('start with empty catalogs, then change "de"', function (done) {
      var clearError = clear({directory});
      if (clearError) {
        done(clearError);
        return;
      } else {
        fs.mkdirSync(directory);
        fs.writeFileSync(directory + '/de.json', '{}');
        fs.writeFileSync(directory + '/en.json', '{}');
        i18n.configure({
          directory: directory,
          register: testScope = {},
          autoReload: true
        });
        setTimeout(function () {
          should.deepEqual(i18n.getCatalog(), {
            de: {},
            en: {}
          });
          done()
        }, timeout);
      }
    });
  
    it('has added new string to catalog and translates correctly', function(done) {
      fs.writeFileSync(directory + '/de.json', '{"Hello":"Hallo"}');
      setTimeout(function () {
        i18n.setLocale(testScope, 'de');
        should.equal(testScope.__('Hello'), 'Hallo');
        should.deepEqual(i18n.getCatalog(), { de: { Hello: 'Hallo' }, en: {} });
        done();      
      }, timeout);
    });
  
    it('will add new string to catalog and files from __()', function(done) {
      should.equal(testScope.__('Hello'), 'Hallo');
      should.deepEqual(i18n.getCatalog(), { de: { Hello: 'Hallo' }, en: {} });
      done();
    });
  
    after('will remove testlocalesauto after tests', function(done) {
      done(clear({directory}));      
    });
  });
  
  describe('autoreload configuration with prefix', function() {
  
    var testScope;
    var directory = upath.join(__dirname, '/../testlocalesautoprefixed');
  
    before('will start with empty catalogs', function (done) {
      var clearError = clear({directory});
      if (clearError) {
        done(clearError);
        return;
      } else {
        fs.mkdirSync(directory);
        fs.writeFileSync(directory + '/customprefix-de.json', '{}');
        fs.writeFileSync(directory + '/customprefix-en.json', '{}');
        i18n.configure({
          directory: directory,
          register: testScope = {},
          prefix: 'customprefix-',
          autoReload: true
        });
        should.deepEqual(i18n.getCatalog(), {
          de: {},
          en: {}
        });
        setTimeout(done, timeout);
      }
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
  
    after('will remove testlocalesautoprefixed after tests', function(done) {
      done(clear({directory}));
    });
  
  });
  
  describe('autoreload configuration with prefix and customextension', function() {
  
    var testScope;
    var directory = upath.join(__dirname, '/../testlocalesautoprefixedext');
  
    before('will start with empty catalogs', function(done) {
      var clearError = clear({directory});
      if (clearError) {
        done(clearError);
        return;          
      } else {
        fs.mkdirSync(directory);
        fs.writeFileSync(directory + '/customprefix-de.customextension', '{}');
        fs.writeFileSync(directory + '/customprefix-en.customextension', '{}');
        i18n.configure({
          directory: directory,
          register: testScope = {},
          prefix: 'customprefix-',
          extension: '.customextension',
          autoReload: true
        });
        should.deepEqual(i18n.getCatalog(), { de: {}, en: {} });
        setTimeout(done, timeout);
      }
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
  
    after('will remove testlocalesautoprefixed after tests', function(done) {
      done(clear({directory}));
    });
  
  });
  
  describe('autoreload configuration with customextension', function() {
  
    var testScope;
    var directory = upath.join(__dirname, '/../testlocalesautocustomextension');
  
    before('will start with empty catalogs', function(done) {
      var clearError = clear({directory});
      if (clearError) {
        done(clearError);
        return;          
      } else {
        fs.mkdirSync(directory);
        fs.writeFileSync(directory + '/de.customextension', '{}');
        fs.writeFileSync(directory + '/en.customextension', '{}');
        i18n.configure({
          directory: directory,
          register: testScope = {},
          extension: '.customextension',
          autoReload: true
        });
        should.deepEqual(i18n.getCatalog(), { de: {}, en: {} });
        setTimeout(done, timeout);      
      }
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
  
    after('will remove testlocalesautoprefixed after tests', function(done) {
      done(clear({directory}));
    });
  
  });
  
  describe('autoreload disabling', function() {
    var testScope = {},
        directory = upath.join(__dirname, '/../testlocalesautodisable')
    ;
  
    beforeEach('will start with empty catalogs', function(done) {
      var clearError = clear({directory});
      if (clearError) {
        done(clearError);
        return;          
      } else {
        fs.mkdirSync(directory);
        fs.writeFileSync(directory + '/de.json', '{}');
        fs.writeFileSync(directory + '/en.json', '{}');
        setTimeout(done, timeout);        
      }
      i18n.configure({
        directory: directory,
        register: testScope = {},
        autoReload: true
      });
    });
  
    it('should disable autoloading via i18n.disableReload()', function (done) {

      setTimeout(function () {
        should.deepEqual(i18n.getCatalog(), { de: {}, en: {} });
  
        i18n.disableReload();
        fs.writeFileSync(directory + '/de.json', '{"Hello":"Hallo"}');
        setTimeout(function () {
          i18n.setLocale(testScope, 'de');
          should.deepEqual(i18n.getCatalog(), { de: {}, en: {} });
          should.equal('Hello', testScope.__('Hello'));
          done();
        }, timeout);
      }, timeout);
    });
  
    it('should disable autoloading via i18n.config()', function (done) {
      setTimeout(function () {
        should.deepEqual(i18n.getCatalog(), { de: {}, en: {} });
  
        i18n.configure({
          directory: directory,
          register: testScope,
          autoReload: false
        });
        setTimeout(function () {
          fs.writeFileSync(directory + '/de.json', '{"Hello":"Hallo"}');
          setTimeout(function () {
            i18n.setLocale(testScope, 'de');
            should.deepEqual(i18n.getCatalog(), { de: {}, en: {} });
            should.notEqual('Hallo', testScope.__('Hello'));
            done();
          }, timeout);
        }, timeout);
      }, timeout);
    });
  
    afterEach('will remove /testlocalesautodisable after tests', function (done) {
        done(clear({directory}));
    });

  });
});
