/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

var i18n = require('../i18n'),
    should = require("should");

i18n.configure({
  locales: ['en', 'de'],
  register: global,
  defaultLocale: 'en'
});


describe('Module Setup', function () {
  it('should export a valid version', function () {
    should.equal(i18n.version, '0.3.8');
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

    describe('i18nTranslate', function () {
      it('should return en translations as expected', function () {
        i18n.setLocale('en');
        should.equal(__('Hello'), 'Hello');
        should.equal(__('Hello %s, how are you today?', 'Marcus'), 'Hello Marcus, how are you today?');
        should.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Hello Marcus, how are you today? How was your weekend.');
      });

      it('should return de translations as expected', function () {
        i18n.setLocale('de');
        should.equal(__('Hello'), 'Hallo');
        should.equal(__('Hello %s, how are you today?', 'Marcus'), 'Hallo Marcus, wie geht es dir heute?');
        should.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Hallo Marcus, wie geht es dir heute? Wie war dein Wochenende.');
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
    });
  });


  describe('Local Scope', function () {
    var req = {
      "request": "GET /test",
      __: i18n.__,
      __n: i18n.__n,
    };
    describe('i18nSetLocale and i18nGetLocale', function () {
      it('should return the current local setting, when used with 2 args', function () {
        i18n.setLocale(req, 'en').should.equal('en');
      });

      it('while getLocale should still return the previous global setting', function () {
        i18n.getLocale().should.equal('de');
      });

      it('now getLocale should return local locale when used with local object as 1st arg', function () {
        i18n.getLocale(req).should.equal('en');
      });
    });

    describe('i18nTranslate', function () {
      it('has to use local translation in en', function () {
        i18n.setLocale(req, 'en').should.equal('en');
        req.__('Hello').should.equal('Hello');
      });

      it('while the global translation remains untouched', function () {
        should.equal(__('Hello'), 'Hallo');
      });

      it('and has to use local translation in de', function () {
        i18n.setLocale(req, 'de').should.equal('de');
        req.__('Hello').should.equal('Hallo');
      });

      it('still the global translation remains untouched', function () {
        should.equal(__('Hello'), 'Hallo');
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
    });
  });
});
