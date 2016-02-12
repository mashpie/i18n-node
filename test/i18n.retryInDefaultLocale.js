/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

// now with coverage suport
var i18n = require('../i18n'),
  should = require("should"),
    path = require("path");

describe('retryInDefaultLocale', function () {
  beforeEach(function () {
    i18n.removeLocale('nl');
    i18n.configure({
      locales: ['en', 'nl'],
      directory: './locales',
      register: global,
      updateFiles: false,
      objectNotation: true,
      retryInDefaultLocale: true
    });
  });

  describe('singular', function () {
    var phrase = {phrase: 'greeting.formal', locale: 'nl'};

    it('should return for return english translation', function () {
      i18n.options.retryInDefaultLocale = false;
      should.equal(i18n.__(phrase), 'greeting.formal');

      // reload cache, becasue previous command already add new property
      i18n.removeLocale('nl');

      i18n.options.retryInDefaultLocale = true;
      should.equal(i18n.__(phrase), 'Hello');
    });

    it('should work multple times (not set wrong cache)', function () {
      for (var i = 0; i <= 5; i += 1) {
        should.equal(i18n.__(phrase), 'Hello', "Fail on " + i + " interation");
      }
    });

    it('should set cache to work fast', function () {
      i18n.__(phrase);
      should.equal(i18n.getCatalog('nl').greeting.formal, 'Hello');
    });
  });

  describe('plural', function () {
    var phrase = {singular: "cat", plural: "cat", locale: "nl"};

    it('should return for plural', function () {
      i18n.options.retryInDefaultLocale = false;
      should.equal(i18n.__n(phrase, 3), 'cat');

      // reload cache, becasue previous command already add new property
      i18n.removeLocale('nl');

      i18n.options.retryInDefaultLocale = true;
      should.equal(i18n.__n(phrase, 3), '3 cats');
    });

    it('should work multple times (not set wrong cache)', function () {
      for (var i = 0; i <= 5; i += 1) {
        should.equal(i18n.__n(phrase, 3), '3 cats', "Fail on " + i + " interation");
      }
    });

    it('should set cache to work fast', function () {
      should.equal(i18n.__n(phrase, 3), '3 cats');
      should.deepEqual(i18n.getCatalog('nl').cat, {one: "%s cat", other: "%s cats"});
    });
  });

});
