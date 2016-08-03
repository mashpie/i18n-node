/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

// now with coverage suport
var i18n = require('../i18n'),
    should = require("should");

describe('Missing Phrases', function () {

  beforeEach(function() {

    i18n.configure({
      locales: ['en', 'de'],
      fallbacks: {'nl': 'de'},
      directory: './locales',
      updateFiles: false,
      syncFiles: false
    });

  });

  describe('Local Module API', function () {
    var req = {
      request: "GET /test",
      __: i18n.__,
      __n: i18n.__n,
      locale: {},
      headers: {}
    };

    beforeEach(function() {
      i18n.configure({
        locales: ['en', 'de', 'en-GB'],
        defaultLocale: 'en',
        directory: './locales',
        register: req,
        updateFiles: false,
        syncFiles: false
      });
    });

    describe('i18nTranslate', function () {
      it('should return the key if the translation does not exist', function(done) {
        i18n.setLocale(req, 'en').should.equal('en');
        req.__('DoesNotExist').should.equal('DoesNotExist');
        done();
      });
    });
  });

  describe('Global Module API', function () {
    beforeEach(function() {
      i18n.configure({
        locales: ['en', 'de', 'en-GB'],
        defaultLocale: 'en',
        directory: './locales',
        register: global,
        updateFiles: false,
        syncFiles: false
      });
    });

    describe('i18nTranslate', function () {
      it('should return the key if the translation does not exist', function() {
        i18n.setLocale('en');
        should.equal(__('DoesNotExist'), 'DoesNotExist');
      });
    });
  });
});
