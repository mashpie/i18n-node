/* global __, __n */
const i18n = require('..')
const should = require('should')

describe('Module API', () => {
  beforeEach(() => {
    i18n.configure({
      locales: ['en', 'de'],
      fallbacks: { nl: 'de' },
      directory: './locales',
      register: global
    })
  })

  describe('Global Scope', () => {
    describe('i18nSetLocale and i18nGetLocale', () => {
      it('getLocale should return default setting', () => {
        i18n.getLocale().should.equal('en')
      })

      it('setLocale should return the new setting', () => {
        i18n.setLocale('de').should.equal('de')
      })

      it('getLocale should return the new setting', () => {
        i18n.setLocale('de')
        i18n.getLocale().should.equal('de')
      })

      it('setLocale should return a fallback value', () => {
        i18n.setLocale('en')
        i18n.setLocale('nl').should.equal('de')
      })
    })

    describe('i18nGetCatalog', () => {
      it('should return all catalogs when invoked with empty parameters', () => {
        const catalogs = i18n.getCatalog()
        catalogs.should.have.property('en')
        catalogs.en.should.have.property('Hello', 'Hello')
        catalogs.should.have.property('de')
        catalogs.de.should.have.property('Hello', 'Hallo')
      })
      it('should return just the DE catalog when invoked with "de" as parameter', () => {
        i18n.getCatalog('en').should.have.property('Hello', 'Hello')
      })
      it('should return just the EN catalog when invoked with "en" as parameter', () => {
        i18n.getCatalog('de').should.have.property('Hello', 'Hallo')
      })
      it('should return just the DE catalog when invoked with a (fallback) "nl" as parameter', () => {
        i18n.getCatalog('nl').should.have.property('Hello', 'Hallo')
      })
      it('should return false when invoked with unsupported locale as parameter', () => {
        i18n.getCatalog('oO').should.equal(false)
      })
    })

    describe('i18nTranslate', () => {
      it('should return an empty string if the translation is an empty string', () => {
        i18n.setLocale('en')
        should.equal(__('Empty'), '')
      })

      it('should return en translations as expected', () => {
        i18n.setLocale('en')
        should.equal(__('Hello'), 'Hello')
        should.equal(
          __('Hello %s, how are you today?', 'Marcus'),
          'Hello Marcus, how are you today?'
        )
        should.equal(
          __(
            'Hello %s, how are you today? How was your %s.',
            'Marcus',
            __('weekend')
          ),
          'Hello Marcus, how are you today? How was your weekend.'
        )
      })

      it('should return en translations as expected, using mustached messages', () => {
        i18n.setLocale('en')
        should.equal(__('Hello {{name}}', { name: 'Marcus' }), 'Hello Marcus')
        should.equal(
          __('Hello {{{name}}}', { name: '<u>Marcus</u>' }),
          'Hello <u>Marcus</u>'
        )
        should.equal(
          __('Hello {{name}}', { name: '<u>Marcus</u>' }),
          'Hello &lt;u&gt;Marcus&lt;&#x2F;u&gt;'
        )
        should.equal(
          __('Hello {{name}}, how was your %s?', __('weekend'), {
            name: 'Marcus'
          }),
          'Hello Marcus, how was your weekend?'
        )
      })

      it('should return de translations as expected', () => {
        i18n.setLocale('de')
        should.equal(__('Hello'), 'Hallo')
        should.equal(
          __('Hello %s, how are you today?', 'Marcus'),
          'Hallo Marcus, wie geht es dir heute?'
        )
        should.equal(
          __(
            'Hello %s, how are you today? How was your %s.',
            'Marcus',
            __('weekend')
          ),
          'Hallo Marcus, wie geht es dir heute? Wie war dein Wochenende.'
        )
      })

      it('should return de translations as expected, using mustached messages', () => {
        i18n.setLocale('de')

        // named only
        should.equal(__('Hello {{name}}', { name: 'Marcus' }), 'Hallo Marcus')
        should.equal(
          __('Hello {{{name}}}', { name: '<u>Marcus</u>' }),
          'Hallo <u>Marcus</u>'
        )
        should.equal(
          __('Hello {{name}}', { name: '<u>Marcus</u>' }),
          'Hallo &lt;u&gt;Marcus&lt;&#x2F;u&gt;'
        )

        // named + sprintf
        should.equal(
          __('Hello {{name}}, how was your %s?', __('weekend'), {
            name: 'Marcus'
          }),
          'Hallo Marcus, wie war dein Wochenende?'
        )

        // nested
        should.equal(
          __(
            __('Hello {{name}}, how was your %s?', { name: 'Marcus' }),
            __('weekend')
          ),
          'Hallo Marcus, wie war dein Wochenende?'
        )
      })

      it('simple translation should work on global', () => {
        i18n.setLocale('en')
        should.equal(__('Hello'), 'Hello')
        i18n.setLocale('de')
        should.equal(__('Hello'), 'Hallo')
      })

      it('should test the ordering in sprintf', () => {
        i18n.setLocale('en')
        should.equal(
          __('ordered arguments', 'First', 'Second'),
          'Second then First'
        )
        i18n.setLocale('de')
        should.equal(
          __('ordered arguments', 'First', 'Second'),
          'First then Second'
        )
      })

      it('should test more complex sprintf examples', () => {
        i18n.setLocale('en')
        should.equal(
          __('ordered arguments with numbers', 'First', 2, 123.456),
          '2 then First then 123.46'
        )
        i18n.setLocale('de')
        should.equal(
          __('ordered arguments with numbers', 'First', 2, 123.456),
          'First then 2 then 123.46'
        )
      })

      it('should allow for repeated references to the same argument.', () => {
        i18n.setLocale('en')
        should.equal(
          __('repeated argument', 'repeated'),
          'repeated, repeated, repeated'
        )
      })

      it('should also return translations when iterating thru variables values', () => {
        let i = 0
        const greetings = ['Hi', 'Hello', 'Howdy']
        const greetingsDE = ['Hi', 'Hallo', 'Hallöchen']

        i18n.setLocale('en')
        for (i = 0; i < greetings.length; i++) {
          should.equal(greetings[i], __(greetings[i]))
        }

        i18n.setLocale('de')
        for (i = 0; i < greetings.length; i++) {
          should.equal(greetingsDE[i], __(greetings[i]))
        }
      })

      it('should be possible to use an json object as 1st parameter to specifiy a certain locale for that lookup', () => {
        should.equal(
          __({
            phrase: 'Hello',
            locale: 'en'
          }),
          'Hello'
        )
        should.equal(
          __({
            phrase: 'Hello',
            locale: 'de'
          }),
          'Hallo'
        )
        should.equal(
          __({
            locale: 'en',
            phrase: 'Hello'
          }),
          'Hello'
        )
        should.equal(
          __({
            locale: 'de',
            phrase: 'Hello'
          }),
          'Hallo'
        )

        // passing specific locale
        should.equal(__({ phrase: 'Hello', locale: 'de' }), 'Hallo')
        should.equal(
          __({ phrase: 'Hello %s', locale: 'de' }, 'Marcus'),
          'Hallo Marcus'
        )
        should.equal(
          __({ phrase: 'Hello {{name}}', locale: 'de' }, { name: 'Marcus' }),
          'Hallo Marcus'
        )

        should.equal(__({ phrase: 'Hello', locale: 'en' }), 'Hello')
        should.equal(
          __({ phrase: 'Hello %s', locale: 'en' }, 'Marcus'),
          'Hello Marcus'
        )
        should.equal(
          __({ phrase: 'Hello {{name}}', locale: 'en' }, { name: 'Marcus' }),
          'Hello Marcus'
        )

        should.equal(__({ phrase: 'Hello', locale: 'nl' }), 'Hallo')
        should.equal(
          __({ phrase: 'Hello %s', locale: 'nl' }, 'Marcus'),
          'Hallo Marcus'
        )
        should.equal(
          __({ phrase: 'Hello {{name}}', locale: 'nl' }, { name: 'Marcus' }),
          'Hallo Marcus'
        )

        i18n.setLocale('en')
        should.equal(__('Hello'), 'Hello')
        i18n.setLocale('de')
        should.equal(__('Hello'), 'Hallo')
        // Reset so `de` fallback can be tested again
        i18n.setLocale('en')

        i18n.setLocale('nl')
        should.equal(__('Hello'), 'Hallo')
      })
    })

    describe('i18nTranslatePlural', () => {
      it('should return singular or plural form based on last parameter', () => {
        i18n.setLocale('en')
        let singular = __n('%s cat', '%s cats', 1)
        let plural = __n('%s cat', '%s cats', 3)
        should.equal(singular, '1 cat')
        should.equal(plural, '3 cats')

        i18n.setLocale('de')
        singular = __n('%s cat', '%s cats', 1)
        plural = __n('%s cat', '%s cats', 3)
        should.equal(singular, '1 Katze')
        should.equal(plural, '3 Katzen')
      })

      it('should return substituted phrases when used nested', () => {
        i18n.setLocale('en')
        let singular = __n(
          'There is one monkey in the %%s',
          'There are %d monkeys in the %%s',
          1,
          __('tree')
        )
        let plural = __n(
          'There is one monkey in the %%s',
          'There are %d monkeys in the %%s',
          3,
          __('tree')
        )
        should.equal(singular, 'There is one monkey in the tree')
        should.equal(plural, 'There are 3 monkeys in the tree')

        i18n.setLocale('de')
        singular = __n(
          'There is one monkey in the %%s',
          'There are %d monkeys in the %%s',
          1,
          __('tree')
        )
        plural = __n(
          'There is one monkey in the %%s',
          'There are %d monkeys in the %%s',
          3,
          __('tree')
        )
        should.equal(singular, 'Im Baum sitzt ein Affe')
        should.equal(plural, 'Im Baum sitzen 3 Affen')
      })

      it("won't return substitutions when not masked by an extra % (%% issue #49)", () => {
        i18n.setLocale('en')
        let singular = __n(
          'There is one monkey in the %s',
          'There are %d monkeys in the %s',
          1
        )
        let plural = __n(
          'There is one monkey in the %s',
          'There are %d monkeys in the %s',
          3
        )
        should.equal(singular, 'There is one monkey in the 1')
        should.equal(plural, 'There are 3 monkeys in the %s')

        singular = __n(
          'There is one monkey in the %s',
          'There are %d monkeys in the %s',
          1,
          __('tree')
        )
        plural = __n(
          'There is one monkey in the %s',
          'There are %d monkeys in the %s',
          3,
          __('tree')
        )
        should.equal(singular, 'There is one monkey in the 1')
        should.equal(plural, 'There are 3 monkeys in the tree')

        i18n.setLocale('de')
        singular = __n(
          'There is one monkey in the %s',
          'There are %d monkeys in the %s',
          1
        )
        plural = __n(
          'There is one monkey in the %s',
          'There are %d monkeys in the %s',
          3
        )
        should.equal(singular, 'There is one monkey in the 1')
        should.equal(plural, 'There are 3 monkeys in the %s')

        singular = __n(
          'There is one monkey in the %s',
          'There are %d monkeys in the %s',
          1,
          __('tree')
        )
        plural = __n(
          'There is one monkey in the %s',
          'There are %d monkeys in the %s',
          3,
          __('tree')
        )
        should.equal(singular, 'There is one monkey in the 1')
        should.equal(plural, 'There are 3 monkeys in the Baum')
      })

      it('should be possible to use an json object as 1st parameter to specifiy a certain locale for that lookup', () => {
        let singular, plural

        i18n.setLocale('en')
        singular = __n(
          { singular: '%s cat', plural: '%s cats', locale: 'nl' },
          1
        )
        plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'nl' }, 3)
        should.equal(singular, '1 Katze')
        should.equal(plural, '3 Katzen')

        singular = __n(
          { singular: '%s cat', plural: '%s cats', locale: 'en' },
          1
        )
        plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'en' }, 3)
        should.equal(singular, '1 cat')
        should.equal(plural, '3 cats')

        singular = __n(
          { singular: '%s cat', plural: '%s cats', locale: 'de' },
          1
        )
        plural = __n({ singular: '%s cat', plural: '%s cats', locale: 'de' }, 3)
        should.equal(singular, '1 Katze')
        should.equal(plural, '3 Katzen')

        i18n.setLocale('en')
        singular = __n({
          singular: '%s cat',
          plural: '%s cats',
          locale: 'nl',
          count: 1
        })
        plural = __n({
          singular: '%s cat',
          plural: '%s cats',
          locale: 'nl',
          count: 3
        })
        should.equal(singular, '1 Katze')
        should.equal(plural, '3 Katzen')

        singular = __n({
          singular: '%s cat',
          plural: '%s cats',
          locale: 'en',
          count: 1
        })
        plural = __n({
          singular: '%s cat',
          plural: '%s cats',
          locale: 'en',
          count: 3
        })
        should.equal(singular, '1 cat')
        should.equal(plural, '3 cats')

        singular = __n({
          singular: '%s cat',
          plural: '%s cats',
          locale: 'de',
          count: 1
        })
        plural = __n({
          singular: '%s cat',
          plural: '%s cats',
          locale: 'de',
          count: 3
        })
        should.equal(singular, '1 Katze')
        should.equal(plural, '3 Katzen')

        i18n.setLocale('en')
        singular = __n({
          singular: '%s cat',
          plural: '%s cats',
          locale: 'nl',
          count: '1'
        })
        plural = __n({
          singular: '%s cat',
          plural: '%s cats',
          locale: 'nl',
          count: '3'
        })
        should.equal(singular, '1 Katze')
        should.equal(plural, '3 Katzen')

        singular = __n({
          singular: '%s cat',
          plural: '%s cats',
          locale: 'en',
          count: '1'
        })
        plural = __n({
          singular: '%s cat',
          plural: '%s cats',
          locale: 'en',
          count: '3'
        })
        should.equal(singular, '1 cat')
        should.equal(plural, '3 cats')

        singular = __n({
          singular: '%s cat',
          plural: '%s cats',
          locale: 'de',
          count: '1'
        })
        plural = __n({
          singular: '%s cat',
          plural: '%s cats',
          locale: 'de',
          count: '3'
        })
        should.equal(singular, '1 Katze')
        should.equal(plural, '3 Katzen')
      })

      it('should allow two arguments', () => {
        const singular = __n('cat', 1)
        const plural = __n('cat', 3)
        should.equal(singular, '1 cat')
        should.equal(plural, '3 cats')
      })
    })
  })
})
