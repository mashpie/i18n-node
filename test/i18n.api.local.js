/* global __ */
const i18n = require('..')
const should = require('should')

describe('Module API', () => {
  beforeEach(() => {
    i18n.configure({
      locales: ['en', 'de'],
      fallbacks: { nl: 'de' },
      directory: './locales'
    })
  })

  describe('Local Scope', () => {
    const req = {
      request: 'GET /test',
      __: i18n.__,
      __n: i18n.__n,
      locale: {},
      headers: {}
    }

    beforeEach(() => {
      i18n.configure({
        locales: ['en', 'de', 'en-GB'],
        defaultLocale: 'en',
        directory: './locales',
        register: req
      })
    })

    describe('i18nInit', () => {
      beforeEach(() => {
        req.headers = {}
        delete req.languages
        delete req.language
        delete req.locale
        delete req.region
        delete req.regions
      })

      it('should set language to first-choice language from header when first choice is available', () => {
        req.headers['accept-language'] = 'de,en;q=0.8'
        i18n.init(req)
        i18n.getLocale(req).should.equal('de')
      })
      it('should set regional language to first choice from header when first choice is available', () => {
        req.headers['accept-language'] = 'en-GB,en;q=0.8'
        i18n.init(req)
        i18n.getLocale(req).should.equal('en-GB')
      })
      it('should set fallback language from header when first choice is not available', () => {
        req.headers['accept-language'] = 'zh,de;q=0.8,en;q=0.4'
        i18n.init(req)
        i18n.getLocale(req).should.equal('de')
      })
      it('should set fallback regional language from header when first choice is not available', () => {
        req.headers['accept-language'] = 'zh,en-GB;q=0.8,de;q=0.4'
        i18n.init(req)
        i18n.getLocale(req).should.equal('en-GB')
      })
      it('should set fallback language from header when first choice regional language is not available', () => {
        req.headers['accept-language'] = 'en-CA,en;q=0.9,fr;q=0.5'
        i18n.init(req)
        i18n.getLocale(req).should.equal('en')
      })
      it('should set default language when no available language is found in header', () => {
        req.headers['accept-language'] = 'zh,sv;q=0.8,ja;q=0.6'
        i18n.init(req)
        i18n.getLocale(req).should.equal('en')
      })
      it('should set default language when an available language is specified with zero quality factor', () => {
        req.headers['accept-language'] = 'da,de;q=0'
        i18n.init(req)
        i18n.getLocale(req).should.equal('en')
      })
      it('should set correct fallback language when quality factors are specified out of order', () => {
        req.headers['accept-language'] = 'pt,en;q=0.1,de;q=0.9'
        i18n.init(req)
        i18n.getLocale(req).should.equal('de')
      })
      it('should set fallback language from regional language when no exact match in header', () => {
        req.headers['accept-language'] = 'de-CH,fr;q=0.8'
        i18n.init(req)
        i18n.getLocale(req).should.equal('de')
      })
    })

    describe('Object as parameter', () => {
      describe('i18nSetLocale and i18nGetLocale', () => {
        beforeEach(() => {
          i18n.setLocale('de')
        })
        afterEach(() => {
          i18n.setLocale('en')
        })
        it('should return the current local setting, when used with 2 args', () => {
          i18n.setLocale(req, 'en').should.equal('en')
        })
        it('while getLocale should still return the previous global setting', () => {
          i18n.setLocale(req, 'en')
          i18n.getLocale().should.equal('de')
        })
        it('now getLocale should return local locale when used with local object as 1st arg', () => {
          i18n.setLocale(req, 'en')
          i18n.getLocale(req).should.equal('en')
        })
        it('should return the default local setting, when used with 2 args and an unsupported local, when req.locale is undefined', () => {
          req.locale = undefined
          i18n.setLocale(req, 'he').should.equal('en')
          req.locale.should.equal('en')
        })
      })
      describe('i18nGetCatalog', () => {
        it('should return the current catalog when invoked with empty parameters', () => {
          i18n.setLocale(req, 'en')
          i18n.getCatalog(req).should.have.property('Hello', 'Hello')
        })
        it('should return just the DE catalog when invoked with "de" as parameter', () => {
          i18n.getCatalog(req, 'de').should.have.property('Hello', 'Hallo')
        })
        it('should return just the EN catalog when invoked with "en" as parameter', () => {
          i18n.getCatalog(req, 'en').should.have.property('Hello', 'Hello')
        })
        it('should return false when invoked with unsupported locale as parameter', () => {
          i18n.getCatalog(req, 'oO').should.equal(false)
        })
      })
      describe('i18nGetLocales', () => {
        it('should return the locales', () => {
          const returnedLocales = i18n.getLocales()
          returnedLocales.sort()
          const expectedLocales = ['en', 'de', 'en-GB']
          expectedLocales.sort()

          returnedLocales.length.should.equal(expectedLocales.length)

          for (let i = 0; i < returnedLocales.length; i++) {
            returnedLocales[i].should.equal(expectedLocales[i])
          }
        })
      })
      describe('i18nAddLocale and i18nRemoveLocale', () => {
        it('addLocale should add a locale', () => {
          const oldLength = i18n.getLocales().length
          i18n.addLocale('fr')
          const locales = i18n.getLocales()
          locales.length.should.equal(oldLength + 1)
          locales.should.containEql('fr')
        })
        it('removeLocale should remove a locale', () => {
          const initialLength = i18n.getLocales().length
          // ensure we have an extra locale
          i18n.addLocale('fr')
          const oldLength = i18n.getLocales().length
          oldLength.should.equal(initialLength + 1)
          i18n.removeLocale('fr')
          const locales = i18n.getLocales()
          locales.length.should.equal(oldLength - 1)
          locales.should.not.containEql('fr')
        })
      })
      describe('i18nTranslate', () => {
        beforeEach(() => {
          i18n.setLocale('de')
        })
        afterEach(() => {
          i18n.setLocale('en')
        })

        it('should return an empty string if the translation is an empty string', (done) => {
          i18n.setLocale(req, 'en').should.equal('en')
          req.__('Empty').should.equal('')
          done()
        })

        it('has to use local translation in en', (done) => {
          i18n.setLocale(req, 'en').should.equal('en')
          req.__('Hello').should.equal('Hello')
          done()
        })
        it('while the global translation remains untouched', (done) => {
          i18n.setLocale(req, 'de')
          should.equal(__('Hello'), 'Hello')
          should.equal(req.__('Hello'), 'Hallo')
          done()
        })
        it('and has to use local translation in de', (done) => {
          i18n.setLocale(req, 'de').should.equal('de')
          req.__('Hello').should.equal('Hallo')
          done()
        })
        it('still the global translation remains untouched', (done) => {
          i18n.setLocale(req, 'de')
          should.equal(__('Hello'), 'Hello')
          should.equal(req.__('Hello'), 'Hallo')
          done()
        })
        it('should be possible to use an json object as 1st parameter to specifiy a certain locale for that lookup', () => {
          i18n.setLocale(req, 'en').should.equal('en')
          should.equal(
            req.__({
              phrase: 'Hello',
              locale: 'en'
            }),
            'Hello'
          )
          should.equal(
            req.__({
              phrase: 'Hello',
              locale: 'de'
            }),
            'Hallo'
          )
          should.equal(
            req.__({
              locale: 'en',
              phrase: 'Hello'
            }),
            'Hello'
          )
          should.equal(
            req.__({
              locale: 'de',
              phrase: 'Hello'
            }),
            'Hallo'
          )
          req.__('Hello').should.equal('Hello')

          i18n.setLocale(req, 'de').should.equal('de')
          should.equal(
            req.__({
              phrase: 'Hello',
              locale: 'en'
            }),
            'Hello'
          )
          should.equal(
            req.__({
              phrase: 'Hello',
              locale: 'de'
            }),
            'Hallo'
          )
          should.equal(
            req.__({
              locale: 'en',
              phrase: 'Hello'
            }),
            'Hello'
          )
          should.equal(
            req.__({
              locale: 'de',
              phrase: 'Hello'
            }),
            'Hallo'
          )
          req.__('Hello').should.equal('Hallo')
        })
      })
    })

    describe('Attached to object', () => {
      describe('i18nSetLocale and i18nGetLocale', () => {
        beforeEach(() => {
          i18n.setLocale('de')
        })
        afterEach(() => {
          i18n.setLocale('en')
        })
        it('should return the current local setting, when used with 1 arg', () => {
          req.setLocale('en').should.equal('en')
        })
        it('while getLocale should still return the previous global setting', () => {
          req.setLocale('en')
          i18n.getLocale().should.equal('de')
        })
        it('now getLocale should return local locale', () => {
          req.setLocale('en')
          req.getLocale().should.equal('en')
        })
      })
      describe('i18nGetCatalog', () => {
        it('should return the current catalog when invoked with empty parameters', () => {
          req.setLocale('en')
          req.getCatalog().should.have.property('Hello', 'Hello')
        })
        it('should return just the DE catalog when invoked with "de" as parameter', () => {
          req.getCatalog('de').should.have.property('Hello', 'Hallo')
        })
        it('should return just the EN catalog when invoked with "en" as parameter', () => {
          req.getCatalog('en').should.have.property('Hello', 'Hello')
        })
        it('should return false when invoked with unsupported locale as parameter', () => {
          req.getCatalog('oO').should.equal(false)
        })
      })
      describe('i18nTranslate', () => {
        beforeEach(() => {
          i18n.setLocale('de')
        })
        afterEach(() => {
          i18n.setLocale('en')
        })
        it('has to use local translation in en', () => {
          req.setLocale('en').should.equal('en')
          req.__('Hello').should.equal('Hello')
        })
        it('while the global translation remains untouched', () => {
          req.setLocale('en')
          should.equal(__('Hello'), 'Hello')
          should.equal(req.__('Hello'), 'Hello')
        })
        it('and has to use local translation in de', () => {
          req.setLocale('de').should.equal('de')
          req.__('Hello').should.equal('Hallo')
        })
        it('still the global translation remains untouched', () => {
          req.setLocale('de')
          should.equal(__('Hello'), 'Hello')
          should.equal(req.__('Hello'), 'Hallo')
        })
        it('should be possible to use an json object as 1st parameter to specifiy a certain locale for that lookup', () => {
          req.setLocale('en').should.equal('en')

          should.equal(
            req.__({
              phrase: 'Hello',
              locale: 'en'
            }),
            'Hello'
          )
          should.equal(
            req.__({
              phrase: 'Hello',
              locale: 'de'
            }),
            'Hallo'
          )
          should.equal(
            req.__({
              locale: 'en',
              phrase: 'Hello'
            }),
            'Hello'
          )
          should.equal(
            req.__({
              locale: 'de',
              phrase: 'Hello'
            }),
            'Hallo'
          )
          req.__('Hello').should.equal('Hello')

          req.setLocale('de').should.equal('de')

          should.equal(
            req.__({
              phrase: 'Hello',
              locale: 'en'
            }),
            'Hello'
          )
          should.equal(
            req.__({
              phrase: 'Hello',
              locale: 'de'
            }),
            'Hallo'
          )
          should.equal(
            req.__({
              locale: 'en',
              phrase: 'Hello'
            }),
            'Hello'
          )
          should.equal(
            req.__({
              locale: 'de',
              phrase: 'Hello'
            }),
            'Hallo'
          )
          req.__('Hello').should.equal('Hallo')
        })
      })
    })

    describe('i18nTranslatePlural', () => {
      it('should return singular or plural form based on last parameter', () => {
        i18n.setLocale(req, 'en')
        let singular = req.__n('%s cat', '%s cats', 1)
        let plural = req.__n('%s cat', '%s cats', 3)
        should.equal(singular, '1 cat')
        should.equal(plural, '3 cats')

        i18n.setLocale(req, 'de')
        singular = req.__n('%s cat', '%s cats', 1)
        plural = req.__n('%s cat', '%s cats', 3)
        should.equal(singular, '1 Katze')
        should.equal(plural, '3 Katzen')
      })

      it('should return substituted phrases when used nested', () => {
        i18n.setLocale(req, 'en')
        let singular = req.__n(
          'There is one monkey in the %%s',
          'There are %d monkeys in the %%s',
          1,
          req.__('tree')
        )
        let plural = req.__n(
          'There is one monkey in the %%s',
          'There are %d monkeys in the %%s',
          3,
          req.__('tree')
        )
        should.equal(singular, 'There is one monkey in the tree')
        should.equal(plural, 'There are 3 monkeys in the tree')

        i18n.setLocale(req, 'de')
        singular = req.__n(
          'There is one monkey in the %%s',
          'There are %d monkeys in the %%s',
          1,
          req.__('tree')
        )
        plural = req.__n(
          'There is one monkey in the %%s',
          'There are %d monkeys in the %%s',
          3,
          req.__('tree')
        )
        should.equal(singular, 'Im Baum sitzt ein Affe')
        should.equal(plural, 'Im Baum sitzen 3 Affen')
      })

      it("won't return substitutions when not masked by an extra % (%% issue #49)", () => {
        i18n.setLocale(req, 'en')
        let singular = req.__n(
          'There is one monkey in the %s',
          'There are %d monkeys in the %s',
          1,
          req.__('tree')
        )
        let plural = req.__n(
          'There is one monkey in the %s',
          'There are %d monkeys in the %s',
          3,
          req.__('tree')
        )
        should.equal(singular, 'There is one monkey in the 1')
        should.equal(plural, 'There are 3 monkeys in the tree')
        singular = req.__n(
          'There is one monkey in the %s',
          'There are %d monkeys in the %s',
          1
        )
        plural = req.__n(
          'There is one monkey in the %s',
          'There are %d monkeys in the %s',
          3
        )
        should.equal(singular, 'There is one monkey in the 1')
        should.equal(plural, 'There are 3 monkeys in the %s')

        i18n.setLocale(req, 'de')
        singular = req.__n(
          'There is one monkey in the %s',
          'There are %d monkeys in the %s',
          1,
          req.__('tree')
        )
        plural = req.__n(
          'There is one monkey in the %s',
          'There are %d monkeys in the %s',
          3,
          req.__('tree')
        )
        should.equal(singular, 'There is one monkey in the 1')
        should.equal(plural, 'There are 3 monkeys in the Baum')
        singular = req.__n(
          'There is one monkey in the %s',
          'There are %d monkeys in the %s',
          1
        )
        plural = req.__n(
          'There is one monkey in the %s',
          'There are %d monkeys in the %s',
          3
        )
        should.equal(singular, 'There is one monkey in the 1')
        should.equal(plural, 'There are 3 monkeys in the %s')
      })

      it('should be possible to use an json object as 1st parameter to specifiy a certain locale for that lookup', () => {
        i18n.setLocale(req, 'en')
        let singular = req.__n(
          { singular: '%s cat', plural: '%s cats', locale: 'de' },
          1
        )
        let plural = req.__n(
          { singular: '%s cat', plural: '%s cats', locale: 'de' },
          3
        )
        should.equal(singular, '1 Katze')
        should.equal(plural, '3 Katzen')

        singular = req.__n(
          { singular: '%s cat', plural: '%s cats', locale: 'en' },
          1
        )
        plural = req.__n(
          { singular: '%s cat', plural: '%s cats', locale: 'en' },
          3
        )
        should.equal(singular, '1 cat')
        should.equal(plural, '3 cats')

        singular = req.__n({
          singular: '%s cat',
          plural: '%s cats',
          locale: 'en',
          count: 1
        })
        plural = req.__n({
          singular: '%s cat',
          plural: '%s cats',
          locale: 'en',
          count: 3
        })
        should.equal(singular, '1 cat')
        should.equal(plural, '3 cats')

        singular = req.__n({
          singular: '%s cat',
          plural: '%s cats',
          locale: 'de',
          count: 1
        })
        plural = req.__n({
          singular: '%s cat',
          plural: '%s cats',
          locale: 'de',
          count: 3
        })
        should.equal(singular, '1 Katze')
        should.equal(plural, '3 Katzen')

        singular = req.__n({
          singular: '%s cat',
          plural: '%s cats',
          locale: 'en',
          count: '1'
        })
        plural = req.__n({
          singular: '%s cat',
          plural: '%s cats',
          locale: 'en',
          count: '3'
        })
        should.equal(singular, '1 cat')
        should.equal(plural, '3 cats')

        singular = req.__n({
          singular: '%s cat',
          plural: '%s cats',
          locale: 'de',
          count: '1'
        })
        plural = req.__n({
          singular: '%s cat',
          plural: '%s cats',
          locale: 'de',
          count: '3'
        })
        should.equal(singular, '1 Katze')
        should.equal(plural, '3 Katzen')

        i18n.setLocale(req, 'de')
      })
    })
  })
})
