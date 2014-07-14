/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

// now with coverage suport
var i18n = process.env.EXPRESS_COV ? require('../i18n-cov') : require('../i18n'),
    should = require("should");

i18n.configure({
  locales: ['en', 'de'],
  directory: './locales',
  register: global
});


describe('Module Setup', function () {
  it('should export a valid version', function () {
    should.equal(i18n.version, '0.5.0');
  });

  it('should export configure as i18nConfigure', function () {
    should.equal(typeof i18n.configure, 'function');
    should.equal(i18n.configure.name, 'i18nConfigure');
  });

  it('should export init as i18nInit', function () {
    should.equal(typeof i18n.init, 'function');
    should.equal(i18n.init.name, 'i18nInit');
  });

  it('should export __ as i18nTranslate', function () {
    should.equal(typeof i18n.__, 'function');
    should.equal(i18n.__.name, 'i18nTranslate');
  });

  it('should export __n as i18nTranslatePlural', function () {
    should.equal(typeof i18n.__n, 'function');
    should.equal(i18n.__n.name, 'i18nTranslatePlural');
  });

  it('should export setLocale as i18nSetLocale', function () {
    should.equal(typeof i18n.setLocale, 'function');
    should.equal(i18n.setLocale.name, 'i18nSetLocale');
  });

  it('should export getLocale as i18nGetLocale', function () {
    should.equal(typeof i18n.getLocale, 'function');
    should.equal(i18n.getLocale.name, 'i18nGetLocale');
  });

  it('should export getCatalog as i18nGetCatalog', function () {
    should.equal(typeof i18n.getCatalog, 'function');
    should.equal(i18n.getCatalog.name, 'i18nGetCatalog');
  });
});

describe('Module API', function () {
  describe('Global Scope', function () {
    describe('i18nSetLocale and i18nGetLocale', function () {
      it('getLocale should return default setting', function () {
        i18n.getLocale().should.equal('en');
      });

      it('setLocale should return the new setting', function () {
        i18n.setLocale('de').should.equal('de');
      });

      it('and getLocale should return the new setting', function () {
        i18n.getLocale().should.equal('de');
      });
    });

    describe('i18nGetCatalog', function () {
      it('should return all catalogs when invoked with empty parameters', function () {
        var catalogs = i18n.getCatalog();
        catalogs.should.have.property('en');
        catalogs.en.should.have.property('Hello', 'Hello');
        catalogs.should.have.property('de');
        catalogs.de.should.have.property('Hello', 'Hallo');
      });
      it('should return just the DE catalog when invoked with "de" as parameter', function () {
        i18n.getCatalog('en').should.have.property('Hello', 'Hello');
      });
      it('should return just the EN catalog when invoked with "en" as parameter', function () {
        i18n.getCatalog('de').should.have.property('Hello', 'Hallo');
      });
      it('should return false when invoked with unsupported locale as parameter', function () {
        i18n.getCatalog('oO').should.equal(false);
      });
    });

    describe('i18nTranslate', function () {
      it('should return en translations as expected', function () {
        i18n.setLocale('en');
        should.equal(__('Hello'), 'Hello');
        should.equal(__('Hello %s, how are you today?', 'Marcus'), 'Hello Marcus, how are you today?');
        should.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Hello Marcus, how are you today? How was your weekend.');
      });

      it('should return en translations as expected, using mustached messages', function () {
        i18n.setLocale('en');
        should.equal(__('Hello {{name}}', { name: 'Marcus' }), 'Hello Marcus');
        should.equal(__('Hello {{name}}, how was your %s?', __('weekend'), { name: 'Marcus' }), 'Hello Marcus, how was your weekend?');
      });

      it('should return de translations as expected', function () {
        i18n.setLocale('de');
        should.equal(__('Hello'), 'Hallo');
        should.equal(__('Hello %s, how are you today?', 'Marcus'), 'Hallo Marcus, wie geht es dir heute?');
        should.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Hallo Marcus, wie geht es dir heute? Wie war dein Wochenende.');
      });

      it('should return de translations as expected, using mustached messages', function () {
        i18n.setLocale('de');
        should.equal(__('Hello {{name}}', { name: 'Marcus' }), 'Hallo Marcus');
        should.equal(__('Hello {{name}}, how was your %s?', __('weekend'), { name: 'Marcus' }), 'Hallo Marcus, wie war dein Wochenende?');
      });

      it('should also return translations when iterating thru variables values', function () {
        var i = 0,
            greetings = ['Hi', 'Hello', 'Howdy'],
            greetingsDE = ['Hi', 'Hallo', 'Hallöchen'];

        i18n.setLocale('en');
        for (i = 0; i < greetings.length; i++) {
          should.equal(greetings[i], __(greetings[i]));
        }

        i18n.setLocale('de');
        for (i = 0; i < greetings.length; i++) {
          should.equal(greetingsDE[i], __(greetings[i]));
        }
      });

      it('should be possible to use an json object as 1st parameter to specifiy a certain locale for that lookup', function () {
        should.equal(__({
          phrase: "Hello",
          locale: "en"
        }), 'Hello');
        should.equal(__({
          phrase: "Hello",
          locale: "de"
        }), 'Hallo');
        should.equal(__({
          locale: "en",
          phrase: "Hello"
        }), 'Hello');
        should.equal(__({
          locale: "de",
          phrase: "Hello"
        }), 'Hallo');

        // passing specific locale
        should.equal(__({phrase: 'Hello', locale: 'de'}), 'Hallo');
        should.equal(__({phrase: 'Hello %s', locale: 'de'}, 'Marcus'), 'Hallo Marcus');
        should.equal(__({phrase: 'Hello {{name}}', locale: 'de'}, { name: 'Marcus' }), 'Hallo Marcus');

        should.equal(__({phrase: 'Hello', locale: 'en'}), 'Hello');
        should.equal(__({phrase: 'Hello %s', locale: 'en'}, 'Marcus'), 'Hello Marcus');
        should.equal(__({phrase: 'Hello {{name}}', locale: 'en'}, { name: 'Marcus' }), 'Hello Marcus');

        i18n.setLocale('de');
        should.equal(__('Hello'), 'Hallo');
        i18n.setLocale('en');
        should.equal(__('Hello'), 'Hello');
      });

    });

    describe('i18nTranslatePlural', function () {
      it('should return singular or plural form based on last parameter', function () {
        i18n.setLocale('en');
        var singular = __n('%s cat', '%s cats', 1),
            plural = __n('%s cat', '%s cats', 3);
        should.equal(singular, '1 cat');
        should.equal(plural, '3 cats');

        i18n.setLocale('de');
        singular = __n('%s cat', '%s cats', 1);
        plural = __n('%s cat', '%s cats', 3);
        should.equal(singular, '1 Katze');
        should.equal(plural, '3 Katzen');
      });

      it('should return substituted phrases when used nested', function () {
        i18n.setLocale('en');
        var singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, __('tree')),
            plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, __('tree'));
        should.equal(singular, 'There is one monkey in the tree');
        should.equal(plural, 'There are 3 monkeys in the tree');

        i18n.setLocale('de');
        singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, __('tree'));
        plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, __('tree'));
        should.equal(singular, 'Im Baum sitzt ein Affe');
        should.equal(plural, 'Im Baum sitzen 3 Affen');
      });

      it('won\'t return substitutions when not masked by an extra % (%% issue #49)', function () {
        i18n.setLocale('en');
        var singular = __n('There is one monkey in the %s', 'There are %d monkeys in the %s', 1, __('tree')),
            plural = __n('There is one monkey in the %s', 'There are %d monkeys in the %s', 3, __('tree'));
        should.equal(singular, 'There is one monkey in the 1');
        should.equal(plural, 'There are 3 monkeys in the undefined');

        i18n.setLocale('de');
        singular = __n('There is one monkey in the %s', 'There are %d monkeys in the %s', 1, __('tree'));
        plural = __n('There is one monkey in the %s', 'There are %d monkeys in the %s', 3, __('tree'));
        should.equal(singular, 'There is one monkey in the 1');
        should.equal(plural, 'There are 3 monkeys in the undefined');
      });

      it('should be possible to use an json object as 1st parameter to specifiy a certain locale for that lookup', function(){
        i18n.setLocale('en');
        var singular = __n({singular: "%s cat", plural: "%s cats", locale: "de"}, 1),
            plural = __n({singular: "%s cat", plural: "%s cats", locale: "de"}, 3);
        should.equal(singular, '1 Katze');
        should.equal(plural, '3 Katzen');

        singular = __n({singular: "%s cat", plural: "%s cats", locale: "en"}, 1);
        plural = __n({singular: "%s cat", plural: "%s cats", locale: "en"}, 3);
        should.equal(singular, '1 cat');
        should.equal(plural, '3 cats');

        singular = __n({singular: "%s cat", plural: "%s cats", locale: "en", count: 1});
        plural = __n({singular: "%s cat", plural: "%s cats", locale: "en", count: 3});
        should.equal(singular, '1 cat');
        should.equal(plural, '3 cats');

        singular = __n({singular: "%s cat", plural: "%s cats", locale: "de", count: 1});
        plural = __n({singular: "%s cat", plural: "%s cats", locale: "de", count: 3});
        should.equal(singular, '1 Katze');
        should.equal(plural, '3 Katzen');

        singular = __n({singular: "%s cat", plural: "%s cats", locale: "en", count: "1"});
        plural = __n({singular: "%s cat", plural: "%s cats", locale: "en", count: "3"});
        should.equal(singular, '1 cat');
        should.equal(plural, '3 cats');

        singular = __n({singular: "%s cat", plural: "%s cats", locale: "de", count: "1"});
        plural = __n({singular: "%s cat", plural: "%s cats", locale: "de", count: "3"});
        should.equal(singular, '1 Katze');
        should.equal(plural, '3 Katzen');
      });
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
    })

    i18n.configure({
      locales: ['en', 'de', 'en-GB'],
      defaultLocale: 'en',
      directory: './locales',
      register: req
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
          i18n.setLocale(req, 'he').should.equal('de');
          req.locale.should.equal('de');
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
      describe('i18nTranslate', function () {
        beforeEach(function() {
          i18n.setLocale('de');
        });
        afterEach(function() {
          i18n.setLocale('en');
        });
        it('has to use local translation in en', function () {
          i18n.setLocale(req, 'en').should.equal('en');
          req.__('Hello').should.equal('Hello');
        });
        it('while the global translation remains untouched', function () {
          i18n.setLocale(req, 'en');
          should.equal(__('Hello'), 'Hallo');
        });
        it('and has to use local translation in de', function () {
          i18n.setLocale(req, 'de').should.equal('de');
          req.__('Hello').should.equal('Hallo');
        });
        it('still the global translation remains untouched', function () {
          i18n.setLocale(req, 'en');
          should.equal(__('Hello'), 'Hallo');
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
          should.equal(__('Hello'), 'Hallo');
        });
        it('and has to use local translation in de', function () {
          req.setLocale('de').should.equal('de');
          req.__('Hello').should.equal('Hallo');
        });
        it('still the global translation remains untouched', function () {
          req.setLocale('de');
          should.equal(__('Hello'), 'Hallo');
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
