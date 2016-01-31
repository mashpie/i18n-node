/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

// now with coverage suport
var i18n = process.env.EXPRESS_COV ? require('../i18n-cov') : require('../i18n'),
  should = require("should"),
    path = require("path");

describe('Fallbacks', function () {
  var req = {
    request: "GET /test",
    __: i18n.__,
    __n: i18n.__n,
    locale: {},
    headers: {}
  };

  describe('Fallback to language', function () {
    beforeEach(function () {
      // Force reloading of i18n, to reset configuration
      var i18nPath = process.env.EXPRESS_COV ? 'i18n-cov' : 'i18n';
      var i18nFilename = path.resolve(i18nPath + '.js');
      delete require.cache[i18nFilename];
      i18n = require( i18nFilename );

      i18n.configure({
        locales: ['en', 'de'],
        defaultLocale: 'en',
        fallbacks: {'foo': 'de', 'de-AT':'de'},
        directory: './locales',
        register: req
      });
      req.headers = {};
      delete req.languages;
      delete req.language;
      delete req.locale;
      delete req.region;
      delete req.regions;
    });

    it('should fall back to "de" for language "foo"', function () {
      req.headers['accept-language'] = 'foo';
      i18n.init(req);
      i18n.getLocale(req).should.equal('de');
    });
    it('should fall back to "de" for language "foo-BAR"', function () {
      req.headers['accept-language'] = 'foo-BAR';
      i18n.init(req);
      i18n.getLocale(req).should.equal('de');
    });
    it('should fall back to "de" for locale "de-AT"', function () {
      req.headers['accept-language'] = 'de-AT';
      i18n.init(req);
      i18n.getLocale(req).should.equal('de');
    });
    it('should fall back to "de" for second-order locale "de-AT"', function () {
      req.headers['accept-language'] = 'de-DK,de-AT';
      i18n.init(req);
      i18n.getLocale(req).should.equal('de');
    });
    it('should use default "en" for valid locale request (ignoring fallbacks)', function () {
      req.headers['accept-language'] = 'en-US,en,de-DK,de-AT';
      i18n.init(req);
      i18n.getLocale(req).should.equal('en');
    });
  });

  describe('Fallback to locale', function () {
    beforeEach(function () {
      // Force reloading of i18n, to reset configuration
      var i18nPath = process.env.EXPRESS_COV ? 'i18n-cov' : 'i18n';
      var i18nFilename = path.resolve(i18nPath + '.js');
      delete require.cache[i18nFilename];
      i18n = require( i18nFilename );

      i18n.configure({
        locales: ['en-US', 'de-DE'],
        defaultLocale: 'en-US',
        fallbacks: {'de': 'de-DE'},
        directory: './locales',
        register: req
      });
      req.headers = {};
      delete req.languages;
      delete req.language;
      delete req.locale;
      delete req.region;
      delete req.regions;
    });

    it('should fall back to "de-DE" for language "de-AT"', function () {
      req.headers['accept-language'] = 'de-AT';
      i18n.init(req);
      i18n.getLocale(req).should.equal('de-DE');
    });
    it('should fall back to "de-DE" for language "de"', function () {
      req.headers['accept-language'] = 'de';
      i18n.init(req);
      i18n.getLocale(req).should.equal('de-DE');
    });
  });

  describe('Keep valid locale', function () {
    beforeEach(function () {
      // Force reloading of i18n, to reset configuration
      var i18nPath = process.env.EXPRESS_COV ? 'i18n-cov' : 'i18n';
      var i18nFilename = path.resolve(i18nPath + '.js');
      delete require.cache[i18nFilename];
      i18n = require( i18nFilename );

      i18n.configure({
        locales: ['de-AT', 'de-DE'],
        defaultLocale: 'en-DE',
        fallbacks: {'de': 'de-DE'},
        directory: './locales',
        register: global
      });
      req.headers = {};
      delete req.languages;
      delete req.language;
      delete req.locale;
      delete req.region;
      delete req.regions;
    });

    it('should fall back to "de-DE" for language "de-SK"', function () {
      req.headers['accept-language'] = 'de-SK';
      i18n.init(req);
      i18n.getLocale(req).should.equal('de-DE');
    });
    it('should NOT fall back to "de-DE" for language "de-AT"', function () {
      req.headers['accept-language'] = 'de-AT';
      i18n.init(req);
      i18n.getLocale(req).should.equal('de-AT');
    });
  });

});
