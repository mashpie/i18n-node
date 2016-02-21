/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

// now with coverage suport
var i18n = require('../i18n'),
    should = require("should");

describe('Module API', function () {

  beforeEach(function() {

    i18n.configure({
      locales: ['en', 'de'],
      fallbacks: {'nl': 'de'},
      directory: './locales'
    });

  });

  describe('Local Scope', function () {
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
        register: req
      });
    });

    describe('i18nInit', function() {
      beforeEach(function() {
        req.headers = {};
        delete req.languages;
        delete req.language;
        delete req.locale;
        delete req.region;
        delete req.regions;
      });

      it('should set language to first-choice language from header when first choice is available', function() {
        req.headers['accept-language'] = 'de,en;q=0.8';
        i18n.init(req);
        i18n.getLocale(req).should.equal('de');
      });
      it('should set regional language to first choice from header when first choice is available', function() {
        req.headers['accept-language'] = 'en-GB,en;q=0.8';
        i18n.init(req);
        i18n.getLocale(req).should.equal('en-GB');
      });
      it('should set fallback language from header when first choice is not available', function() {
        req.headers['accept-language'] = 'zh,de;q=0.8,en;q=0.4';
        i18n.init(req);
        i18n.getLocale(req).should.equal('de');
      });
      it('should set fallback regional language from header when first choice is not available', function() {
        req.headers['accept-language'] = 'zh,en-GB;q=0.8,de;q=0.4';
        i18n.init(req);
        i18n.getLocale(req).should.equal('en-GB');
      });
      it('should set fallback language from header when first choice regional language is not available', function() {
        req.headers['accept-language'] = 'en-CA,en;q=0.9,fr;q=0.5';
        i18n.init(req);
        i18n.getLocale(req).should.equal('en');
      });
      it('should set default language when no available language is found in header', function() {
        req.headers['accept-language'] = 'zh,sv;q=0.8,ja;q=0.6';
        i18n.init(req);
        i18n.getLocale(req).should.equal('en');
      });
      it('should set default language when an available language is specified with zero quality factor', function() {
        req.headers['accept-language'] = 'da,de;q=0';
        i18n.init(req);
        i18n.getLocale(req).should.equal('en');
      });
      it('should set correct fallback language when quality factors are specified out of order', function() {
        req.headers['accept-language'] = 'pt,en;q=0.1,de;q=0.9';
        i18n.init(req);
        i18n.getLocale(req).should.equal('de');
      });
      it('should set fallback language from regional language when no exact match in header', function() {
        req.headers['accept-language'] = 'de-CH,fr;q=0.8';
        i18n.init(req);
        i18n.getLocale(req).should.equal('de');
      });
    });

    describe('Object as parameter', function () {
      describe('i18nSetLocale and i18nGetLocale', function () {
        beforeEach(function() {
          i18n.setLocale('de');
        });
        afterEach(function() {
          i18n.setLocale('en');
        });
        it('should return the current local setting, when used with 2 args', function () {
          i18n.setLocale(req, 'en').should.equal('en');
        });
        it('while getLocale should still return the previous global setting', function () {
          i18n.setLocale(req, 'en');
          i18n.getLocale().should.equal('de');
        });
        it('now getLocale should return local locale when used with local object as 1st arg', function () {
          i18n.setLocale(req, 'en');
          i18n.getLocale(req).should.equal('en');
        });
        it('should return the default local setting, when used with 2 args and an unsupported local, when req.locale is undefined', function() {
          req.locale = undefined;
          i18n.setLocale(req, 'he').should.equal('en');
          req.locale.should.equal('en');
        });
      });
      describe('i18nGetCatalog', function () {
        it('should return the current catalog when invoked with empty parameters', function () {
          i18n.setLocale(req, 'en');
          i18n.getCatalog(req).should.have.property('Hello', 'Hello');
        });
        it('should return just the DE catalog when invoked with "de" as parameter', function () {
          i18n.getCatalog(req, 'de').should.have.property('Hello', 'Hallo');
        });
        it('should return just the EN catalog when invoked with "en" as parameter', function () {
          i18n.getCatalog(req, 'en').should.have.property('Hello', 'Hello');
        });
        it('should return false when invoked with unsupported locale as parameter', function () {
          i18n.getCatalog(req, 'oO').should.equal(false);
        });
      });
      describe('i18nGetLocales', function () {
        it('should return the locales', function () {
          var returnedLocales = i18n.getLocales();
          returnedLocales.sort();
          var expectedLocales = ['en', 'de', 'en-GB'];
          expectedLocales.sort();

          returnedLocales.length.should.equal(expectedLocales.length);

          for (var i = 0; i < returnedLocales.length; i++) {
            returnedLocales[i].should.equal(expectedLocales[i]);
          }
        });
      });
      describe('i18nAddLocale and i18nRemoveLocale', function () {
        it('addLocale should add a locale', function () {
          var oldLength = i18n.getLocales().length;
          i18n.addLocale('fr');
          var locales = i18n.getLocales();
          locales.length.should.equal(oldLength + 1);
          locales.should.containEql('fr');
        });
        it('removeLocale should remove a locale', function () {
          var initialLength = i18n.getLocales().length;
          // ensure we have an extra locale
          i18n.addLocale('fr');
          var oldLength = i18n.getLocales().length;
          oldLength.should.equal(initialLength + 1);
          i18n.removeLocale('fr');
          var locales = i18n.getLocales();
          locales.length.should.equal(oldLength - 1);
          locales.should.not.containEql('fr');
        });
      });
      describe('i18nTranslate', function () {
        beforeEach(function() {
          i18n.setLocale('de');
        });
        afterEach(function() {
          i18n.setLocale('en');
        });
        it('has to use local translation in en', function (done) {
          i18n.setLocale(req, 'en').should.equal('en');
          req.__('Hello').should.equal('Hello');
          done();
        });
        it('while the global translation remains untouched', function (done) {
          i18n.setLocale(req, 'de');
          should.equal(__('Hello'), 'Hello');
          should.equal(req.__('Hello'), 'Hallo');
          done();
        });
        it('and has to use local translation in de', function (done) {
          i18n.setLocale(req, 'de').should.equal('de');
          req.__('Hello').should.equal('Hallo');
          done();
        });
        it('still the global translation remains untouched', function (done) {
          i18n.setLocale(req, 'de');
          should.equal(__('Hello'), 'Hello');
          should.equal(req.__('Hello'), 'Hallo');
          done();
        });
        it('should be possible to use an json object as 1st parameter to specifiy a certain locale for that lookup', function () {
          i18n.setLocale(req, 'en').should.equal('en');
          should.equal(req.__({
            phrase: "Hello",
            locale: "en"
          }), 'Hello');
          should.equal(req.__({
            phrase: "Hello",
            locale: "de"
          }), 'Hallo');
          should.equal(req.__({
            locale: "en",
            phrase: "Hello"
          }), 'Hello');
          should.equal(req.__({
            locale: "de",
            phrase: "Hello"
          }), 'Hallo');
          req.__('Hello').should.equal('Hello');

          i18n.setLocale(req, 'de').should.equal('de');
          should.equal(req.__({
            phrase: "Hello",
            locale: "en"
          }), 'Hello');
          should.equal(req.__({
            phrase: "Hello",
            locale: "de"
          }), 'Hallo');
          should.equal(req.__({
            locale: "en",
            phrase: "Hello"
          }), 'Hello');
          should.equal(req.__({
            locale: "de",
            phrase: "Hello"
          }), 'Hallo');
          req.__('Hello').should.equal('Hallo');
        });
      });
    });

    describe('Attached to object', function () {
      describe('i18nSetLocale and i18nGetLocale', function () {
        beforeEach(function() {
          i18n.setLocale('de');
        });
        afterEach(function() {
          i18n.setLocale('en');
        });
        it('should return the current local setting, when used with 1 arg', function () {
          req.setLocale('en').should.equal('en');
        });
        it('while getLocale should still return the previous global setting', function () {
          req.setLocale('en');
          i18n.getLocale().should.equal('de');
        });
        it('now getLocale should return local locale', function () {
          req.setLocale('en');
          req.getLocale().should.equal('en');
        });
      });
      describe('i18nGetCatalog', function () {
        it('should return the current catalog when invoked with empty parameters', function () {
          req.setLocale('en');
          req.getCatalog().should.have.property('Hello', 'Hello');
        });
        it('should return just the DE catalog when invoked with "de" as parameter', function () {
          req.getCatalog('de').should.have.property('Hello', 'Hallo');
        });
        it('should return just the EN catalog when invoked with "en" as parameter', function () {
          req.getCatalog('en').should.have.property('Hello', 'Hello');
        });
        it('should return false when invoked with unsupported locale as parameter', function () {
          req.getCatalog('oO').should.equal(false);
        });
      });
      describe('i18nTranslate', function () {
        beforeEach(function() {
          i18n.setLocale('de');
        });
        afterEach(function() {
          i18n.setLocale('en');
        });
        it('has to use local translation in en', function () {
          req.setLocale('en').should.equal('en');
          req.__('Hello').should.equal('Hello');
        });
        it('while the global translation remains untouched', function () {
          req.setLocale('en');
          should.equal(__('Hello'), 'Hello');
          should.equal(req.__('Hello'), 'Hello');
        });
        it('and has to use local translation in de', function () {
          req.setLocale('de').should.equal('de');
          req.__('Hello').should.equal('Hallo');
        });
        it('still the global translation remains untouched', function () {
          req.setLocale('de');
          should.equal(__('Hello'), 'Hello');
          should.equal(req.__('Hello'), 'Hallo');
        });
        it('should be possible to use an json object as 1st parameter to specifiy a certain locale for that lookup', function () {
          req.setLocale('en').should.equal('en');

          should.equal(req.__({
            phrase: "Hello",
            locale: "en"
          }), 'Hello');
          should.equal(req.__({
            phrase: "Hello",
            locale: "de"
          }), 'Hallo');
          should.equal(req.__({
            locale: "en",
            phrase: "Hello"
          }), 'Hello');
          should.equal(req.__({
            locale: "de",
            phrase: "Hello"
          }), 'Hallo');
          req.__('Hello').should.equal('Hello');

          req.setLocale('de').should.equal('de');

          should.equal(req.__({
            phrase: "Hello",
            locale: "en"
          }), 'Hello');
          should.equal(req.__({
            phrase: "Hello",
            locale: "de"
          }), 'Hallo');
          should.equal(req.__({
            locale: "en",
            phrase: "Hello"
          }), 'Hello');
          should.equal(req.__({
            locale: "de",
            phrase: "Hello"
          }), 'Hallo');
          req.__('Hello').should.equal('Hallo');
        });
      });
    });


    describe('i18nTranslatePlural', function () {
      it('should return singular or plural form based on last parameter', function () {
        i18n.setLocale(req, 'en');
        var singular = req.__n('%s cat', '%s cats', 1),
            plural = req.__n('%s cat', '%s cats', 3);
        should.equal(singular, '1 cat');
        should.equal(plural, '3 cats');

        i18n.setLocale(req, 'de');
        singular = req.__n('%s cat', '%s cats', 1);
        plural = req.__n('%s cat', '%s cats', 3);
        should.equal(singular, '1 Katze');
        should.equal(plural, '3 Katzen');
      });

      it('should return substituted phrases when used nested', function () {
        i18n.setLocale(req, 'en');
        var singular = req.__n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, req.__('tree')),
            plural = req.__n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, req.__('tree'));
        should.equal(singular, 'There is one monkey in the tree');
        should.equal(plural, 'There are 3 monkeys in the tree');

        i18n.setLocale(req, 'de');
        singular = req.__n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, req.__('tree'));
        plural = req.__n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, req.__('tree'));
        should.equal(singular, 'Im Baum sitzt ein Affe');
        should.equal(plural, 'Im Baum sitzen 3 Affen');
      });

      it('won\'t return substitutions when not masked by an extra % (%% issue #49)', function () {
        i18n.setLocale(req, 'en');
        var singular = req.__n('There is one monkey in the %s', 'There are %d monkeys in the %s', 1, req.__('tree')),
            plural = req.__n('There is one monkey in the %s', 'There are %d monkeys in the %s', 3, req.__('tree'));
        should.equal(singular, 'There is one monkey in the 1');
        should.equal(plural, 'There are 3 monkeys in the undefined');

        i18n.setLocale(req, 'de');
        singular = req.__n('There is one monkey in the %s', 'There are %d monkeys in the %s', 1, req.__('tree'));
        plural = req.__n('There is one monkey in the %s', 'There are %d monkeys in the %s', 3, req.__('tree'));
        should.equal(singular, 'There is one monkey in the 1');
        should.equal(plural, 'There are 3 monkeys in the undefined');
      });

      it('should be possible to use an json object as 1st parameter to specifiy a certain locale for that lookup', function(){
        i18n.setLocale(req, 'en');
        var singular = req.__n({singular: "%s cat", plural: "%s cats", locale: "de"}, 1),
            plural = req.__n({singular: "%s cat", plural: "%s cats", locale: "de"}, 3);
        should.equal(singular, '1 Katze');
        should.equal(plural, '3 Katzen');

        singular = req.__n({singular: "%s cat", plural: "%s cats", locale: "en"}, 1);
        plural = req.__n({singular: "%s cat", plural: "%s cats", locale: "en"}, 3);
        should.equal(singular, '1 cat');
        should.equal(plural, '3 cats');

        singular = req.__n({singular: "%s cat", plural: "%s cats", locale: "en", count: 1});
        plural = req.__n({singular: "%s cat", plural: "%s cats", locale: "en", count: 3});
        should.equal(singular, '1 cat');
        should.equal(plural, '3 cats');

        singular = req.__n({singular: "%s cat", plural: "%s cats", locale: "de", count: 1});
        plural = req.__n({singular: "%s cat", plural: "%s cats", locale: "de", count: 3});
        should.equal(singular, '1 Katze');
        should.equal(plural, '3 Katzen');

        singular = req.__n({singular: "%s cat", plural: "%s cats", locale: "en", count: "1"});
        plural = req.__n({singular: "%s cat", plural: "%s cats", locale: "en", count: "3"});
        should.equal(singular, '1 cat');
        should.equal(plural, '3 cats');

        singular = req.__n({singular: "%s cat", plural: "%s cats", locale: "de", count: "1"});
        plural = req.__n({singular: "%s cat", plural: "%s cats", locale: "de", count: "3"});
        should.equal(singular, '1 Katze');
        should.equal(plural, '3 Katzen');

        i18n.setLocale(req, 'de');
      });
    });
  });
});
