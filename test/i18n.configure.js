/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

var should = require("should"),
    i18n = require('../i18n'),
    fs = require('fs');

i18n.configure({
  locales: ['en', 'de'],
  register: global,
  directory: './testlocales',
  extension: '.json',
  debug: false,
  verbose: false
});

describe('Configuration settings:', function () {

  after(function () {
    var stats = fs.lstatSync('./testlocales');
    should.exist(stats);
    if (stats) {
      fs.unlinkSync('./testlocales/de.json');
      fs.unlinkSync('./testlocales/en.json');
      fs.rmdirSync('./testlocales');
    }
  });

  describe('when using a custom directory with a custom extension', function () {

    it('the setLocale and getLocale should still be able to set current locale', function () {
      should.equal('en', i18n.getLocale(), 'should return default setting');
      should.equal('de', i18n.setLocale('de'), 'should return the new setting');
      should.equal('de', i18n.getLocale(), 'should return the new setting');
    });

    it('and some basic translations should still work', function () {
      i18n.setLocale('en');
      should.equal(__('Hello'), 'Hello');
      should.equal(__('Hello %s, how are you today?', 'Marcus'), 'Hello Marcus, how are you today?');
      should.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Hello Marcus, how are you today? How was your weekend.');
    });

  });
});
