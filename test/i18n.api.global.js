var i18n = require('../i18n'),
  should = require("should");

describe('Module API', function() {

  beforeEach(function() {

    i18n.configure({
      locales: ['en', 'de'],
      fallbacks: { 'nl': 'de' },
      directory: './locales',
      register: global
    });

  });

  describe('Global Scope', function() {

    describe('i18nSetLocale and i18nGetLocale', function() {

      it('getLocale should return default setting', function() {
        i18n.getLocale().should.equal('en');
      });

      it('setLocale should return the new setting', function() {
        i18n.setLocale('de').should.equal('de');
      });

      it('getLocale should return the new setting', function() {
        i18n.setLocale('de');
        i18n.getLocale().should.equal('de');
      });

      it('setLocale should return a fallback value', function() {
        i18n.setLocale('en');
        i18n.setLocale('nl').should.equal('de');
      });

    });

    describe('i18nGetCatalog', function() {
      it('should return all catalogs when invoked with empty parameters', function() {
        var catalogs = i18n.getCatalog();
        catalogs.should.have.property('en');
        catalogs.en.should.have.property('Hello', 'Hello');
        catalogs.should.have.property('de');
        catalogs.de.should.have.property('Hello', 'Hallo');
      });
      it('should return just the DE catalog when invoked with "de" as parameter', function() {
        i18n.getCatalog('en').should.have.property('Hello', 'Hello');
      });
      it('should return just the EN catalog when invoked with "en" as parameter', function() {
        i18n.getCatalog('de').should.have.property('Hello', 'Hallo');
      });
      it('should return just the DE catalog when invoked with a (fallback) "nl" as parameter', function() {
        i18n.getCatalog('nl').should.have.property('Hello', 'Hallo');
      });
      it('should return false when invoked with unsupported locale as parameter', function() {
        i18n.getCatalog('oO').should.equal(false);
      });
    });

    describe('i18nTranslate', function() {
      it('should return en translations as expected', function() {
        i18n.setLocale('en');
        should.equal(__('Hello'), 'Hello');
        should.equal(__('Hello %s, how are you today?', 'Marcus'), 'Hello Marcus, how are you today?');
        should.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Hello Marcus, how are you today? How was your weekend.');
      });

      it('should return en translations as expected, using mustached messages', function() {
        i18n.setLocale('en');
        should.equal(__('Hello {{name}}', { name: 'Marcus' }), 'Hello Marcus');
        should.equal(__('Hello {{name}}, how was your %s?', __('weekend'), { name: 'Marcus' }), 'Hello Marcus, how was your weekend?');
      });

      it('should return de translations as expected', function() {
        i18n.setLocale('de');
        should.equal(__('Hello'), 'Hallo');
        should.equal(__('Hello %s, how are you today?', 'Marcus'), 'Hallo Marcus, wie geht es dir heute?');
        should.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Hallo Marcus, wie geht es dir heute? Wie war dein Wochenende.');
      });

      it('should return de translations as expected, using mustached messages', function() {
        i18n.setLocale('de');

        // named only
        should.equal(__('Hello {{name}}', { name: 'Marcus' }), 'Hallo Marcus');

        // named + sprintf
        should.equal(__('Hello {{name}}, how was your %s?', __('weekend'), { name: 'Marcus' }), 'Hallo Marcus, wie war dein Wochenende?');

        // nested
        should.equal(__(__('Hello {{name}}, how was your %s?', { name: 'Marcus' }), __('weekend')), 'Hallo Marcus, wie war dein Wochenende?');
      });

      it('simple translation should work on global', function() {
        i18n.setLocale('en');
        should.equal(__('Hello'), 'Hello');
        i18n.setLocale('de');
        should.equal(__('Hello'), 'Hallo');
      });

      it('should test the ordering in sprintf', function() {
        i18n.setLocale('en');
        should.equal(__('ordered arguments', "First", "Second"), 'Second then First');
        i18n.setLocale('de');
        should.equal(__('ordered arguments', "First", "Second"), 'First then Second');
      });

      it('should test more complex sprintf examples', function() {
        i18n.setLocale('en');
        should.equal(__('ordered arguments with numbers', "First", 2, 123.456), '2 then First then 123.46');
        i18n.setLocale('de');
        should.equal(__('ordered arguments with numbers', "First", 2, 123.456), 'First then 2 then 123.46');
      });

      it('should allow for repeated references to the same argument.', function() {
        i18n.setLocale('en');
        should.equal(__('repeated argument', "repeated"), 'repeated, repeated, repeated');
      });

      it('should also return translations when iterating thru variables values', function() {
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

      it('should be possible to use an json object as 1st parameter to specifiy a certain locale for that lookup', function() {
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
        should.equal(__({ phrase: 'Hello', locale: 'de' }), 'Hallo');
        should.equal(__({ phrase: 'Hello %s', locale: 'de' }, 'Marcus'), 'Hallo Marcus');
        should.equal(__({ phrase: 'Hello {{name}}', locale: 'de' }, { name: 'Marcus' }), 'Hallo Marcus');

        should.equal(__({ phrase: 'Hello', locale: 'en' }), 'Hello');
        should.equal(__({ phrase: 'Hello %s', locale: 'en' }, 'Marcus'), 'Hello Marcus');
        should.equal(__({ phrase: 'Hello {{name}}', locale: 'en' }, { name: 'Marcus' }), 'Hello Marcus');

        should.equal(__({ phrase: 'Hello', locale: 'nl' }), 'Hallo');
        should.equal(__({ phrase: 'Hello %s', locale: 'nl' }, 'Marcus'), 'Hallo Marcus');
        should.equal(__({ phrase: 'Hello {{name}}', locale: 'nl' }, { name: 'Marcus' }), 'Hallo Marcus');

        i18n.setLocale('en');
        should.equal(__('Hello'), 'Hello');
        i18n.setLocale('de');
        should.equal(__('Hello'), 'Hallo');
        // Reset so `de` fallback can be tested again
        i18n.setLocale('en');

        i18n.setLocale('nl');
        should.equal(__('Hello'), 'Hallo');
      });

    });

    describe('i18nTranslatePlural', function() {
      it('should return singular or plural form based on last parameter', function() {
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

      it('should return substituted phrases when used nested', function() {
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

      it('won\'t return substitutions when not masked by an extra % (%% issue #49)', function() {
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

      it('should be possible to use an json object as 1st parameter to specifiy a certain locale for that lookup', function() {
        var singular, plural;

        i18n.setLocale('en');
        singular = __n({ singular: "%s cat", plural: "%s cats", locale: "nl" }, 1);
        plural = __n({ singular: "%s cat", plural: "%s cats", locale: "nl" }, 3);
        should.equal(singular, '1 Katze');
        should.equal(plural, '3 Katzen');

        singular = __n({ singular: "%s cat", plural: "%s cats", locale: "en" }, 1);
        plural = __n({ singular: "%s cat", plural: "%s cats", locale: "en" }, 3);
        should.equal(singular, '1 cat');
        should.equal(plural, '3 cats');

        singular = __n({ singular: "%s cat", plural: "%s cats", locale: "de" }, 1);
        plural = __n({ singular: "%s cat", plural: "%s cats", locale: "de" }, 3);
        should.equal(singular, '1 Katze');
        should.equal(plural, '3 Katzen');

        i18n.setLocale('en');
        singular = __n({ singular: "%s cat", plural: "%s cats", locale: "nl", count: 1 });
        plural = __n({ singular: "%s cat", plural: "%s cats", locale: "nl", count: 3 });
        should.equal(singular, '1 Katze');
        should.equal(plural, '3 Katzen');

        singular = __n({ singular: "%s cat", plural: "%s cats", locale: "en", count: 1 });
        plural = __n({ singular: "%s cat", plural: "%s cats", locale: "en", count: 3 });
        should.equal(singular, '1 cat');
        should.equal(plural, '3 cats');

        singular = __n({ singular: "%s cat", plural: "%s cats", locale: "de", count: 1 });
        plural = __n({ singular: "%s cat", plural: "%s cats", locale: "de", count: 3 });
        should.equal(singular, '1 Katze');
        should.equal(plural, '3 Katzen');

        i18n.setLocale('en');
        singular = __n({ singular: "%s cat", plural: "%s cats", locale: "nl", count: "1" });
        plural = __n({ singular: "%s cat", plural: "%s cats", locale: "nl", count: "3" });
        should.equal(singular, '1 Katze');
        should.equal(plural, '3 Katzen');

        singular = __n({ singular: "%s cat", plural: "%s cats", locale: "en", count: "1" });
        plural = __n({ singular: "%s cat", plural: "%s cats", locale: "en", count: "3" });
        should.equal(singular, '1 cat');
        should.equal(plural, '3 cats');

        singular = __n({ singular: "%s cat", plural: "%s cats", locale: "de", count: "1" });
        plural = __n({ singular: "%s cat", plural: "%s cats", locale: "de", count: "3" });
        should.equal(singular, '1 Katze');
        should.equal(plural, '3 Katzen');
      });

      it('should allow two arguments', function() {
        var singular = __n("cat", 1);
        var plural = __n("cat", 3);
        should.equal(singular, '1 cat');
        should.equal(plural, '3 cats');
      });
    });
  });
});