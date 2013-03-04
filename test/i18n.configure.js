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

    it('setting locales should return appropiate locale', function () {
      var my_setLocale = i18n.setLocale('de'),
          my_getLocale = i18n.getLocale();
      should.equal('de', my_setLocale);
      should.equal('de', my_getLocale);
    });

    it('and some basic translations should still work', function () {
      i18n.setLocale('en');
      should.equal(__('Hello'), 'Hello');
      should.equal(__('Hello %s, how are you today?', 'Marcus'), 'Hello Marcus, how are you today?');
      should.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Hello Marcus, how are you today? How was your weekend.');
    });

  });
});
