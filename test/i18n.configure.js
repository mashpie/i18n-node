var i18n = require('../i18n'),
  should = require('should'),
  fs = require('fs');

describe('configure with multiDirectories set to true', function() {

  var testScope = {};

  beforeEach(function() {
    i18n.configure({
      defaultLocale: 'en',
      locales: ['en', 'fr'],
      multiDirectories: true,
      directory: __dirname + '/../locales',
      register: testScope
    });
    testScope.__('Hello');
  });

  afterEach(function() {
    try {
      var stats = fs.lstatSync('./customlocales');
      should.exist(stats);
    } catch (e) {}
    if (stats) {
      try {
        fs.unlinkSync('./customlocales/en.json');
      } catch (e) {}
      try {
        fs.unlinkSync('./customlocales/fr.json');
      } catch (e) {}
      try {
        fs.unlinkSync('./customlocales/ru.json');
      } catch (e) {}
      try {
        fs.rmdirSync('./customlocales');
      } catch (e) {}
    }

  });

  it('should set dirName to "default" if not provided', function() {
    i18n.configure({
      locales: ['ru']
    });

    should.equal(testScope.__('Hello'), testScope.__('Hello', 'default'));
  });

  it('should be possible to setup a custom directory', function() {
    i18n.configure({
      locales: ['ru'],
      directory: './customlocales',
      dirName: 'customeModule'
    }
    );
    testScope.__('Hello');
    var stats = fs.lstatSync('./customlocales');
    should.exist(stats);
  });

  it('should add locales', function() {
    i18n.configure({
      locales: ['ru'],
      dirName: 'customeModule',
      directory: './customlocales'
    });
    should.deepEqual(['en', 'fr', 'ru'], i18n.getLocales());
  });

  it('should return false when directory path is not a string', function() {
    var wrongConfig = {
      locales: ['en'],
      dirName: 'dirName',
      directory: ['not', 'a', 'string']
    };
    should.deepEqual(false, i18n.configure(wrongConfig));
  });

});

describe('Module Config', function() {

  var testScope = {};

  beforeEach(function() {
    i18n.configure({
      locales: ['en', 'de'],
      register: testScope,
      directory: './customlocales',
      extension: '.customextension',
      prefix: 'customprefix-',
      multiDirectories: false
    });
    testScope.__('Hello');
  });

  afterEach(function() {
    var stats = fs.lstatSync('./customlocales');
    should.exist(stats);
    if (stats) {
      try {
        fs.unlinkSync('./customlocales/customprefix-de.customextension');
        fs.unlinkSync('./customlocales/customprefix-en.customextension');
        fs.rmdirSync('./customlocales');
      } catch (e) {}
    }

  });

  it('should be possible to setup a custom directory', function() {
    var stats = fs.lstatSync('./customlocales');
    should.exist(stats);
  });

  it('should be possible to read custom files with custom prefixes and extensions', function() {
    var statsde = fs.lstatSync('./customlocales/customprefix-de.customextension'),
    statsen = fs.lstatSync('./customlocales/customprefix-en.customextension');
    should.exist(statsde);
    should.exist(statsen);
  });

});
