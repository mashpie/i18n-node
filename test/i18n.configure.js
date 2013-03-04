/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

var should = require("should"),
    i18n = require('../i18n'),
    fs = require('fs');

describe('Configuration settings:', function () {

  var testScope = {};

  beforeEach(function () {
    i18n.configure({
      locales: ['en', 'de'],
      register: testScope,
      directory: './testlocales',
      extension: '.json',
      debug: false,
      verbose: false
    });
  });

  afterEach(function () {
    var stats = fs.lstatSync('./testlocales');
    should.exist(stats);
    if (stats) {
      fs.unlinkSync('./testlocales/de.json');
      fs.unlinkSync('./testlocales/en.json');
      fs.rmdirSync('./testlocales');
    }
  });

  describe('when using a custom directory with a custom extension', function () {

    it('setting locales in scope should return appropiate locale', function () {
      should.equal('de', i18n.setLocale(testScope, 'de'));
    });

    it('getting locales in scope should return appropiate locale', function () {
      i18n.setLocale(testScope, 'de')
      should.equal('de', testScope.getLocale(testScope));
    });

    it('getting defaultLocale should return appropiate locale', function () {
      should.equal('en', i18n.getLocale());
    });

    it('basic translations should work', function () {
      i18n.setLocale(testScope, 'en');
      should.equal(testScope.__('Hello'), 'Hello');
      should.equal(testScope.__('Hello %s, how are you today?', 'Marcus'), 'Hello Marcus, how are you today?');
      should.equal(testScope.__('Hello %s, how are you today? How was your %s.', 'Marcus', testScope.__('weekend')), 'Hello Marcus, how are you today? How was your weekend.');
    });

    it('the directory should exist', function () {
      var stats = fs.lstatSync('./testlocales');
      should.exist(stats);
    });

    it('the files should exist', function () {
      var statsde = fs.lstatSync('./testlocales/de.json'),
          statsen = fs.lstatSync('./testlocales/en.json');
      should.exist(statsde);
      should.exist(statsen);
    });

  });
});
