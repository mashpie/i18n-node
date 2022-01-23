const { I18n } = require('..')
const should = require('should')

describe('retryInDefaultLocale', () => {
  const i18nWithDefault = new I18n({
    locales: ['en', 'nl'],
    defaultLocale: 'en',
    directory: './locales',
    updateFiles: false,
    objectNotation: true,
    retryInDefaultLocale: true
  })

  const i18nNoDefault = new I18n({
    locales: ['en', 'nl'],
    defaultLocale: 'en',
    directory: './locales',
    updateFiles: false,
    objectNotation: true,
    retryInDefaultLocale: false
  })

  describe('singular with retryInDefaultLocale enabled', () => {
    it('should use translations from defaultLocale for missing key', () => {
      i18nWithDefault.setLocale('nl')
      should.equal(i18nWithDefault.getLocale(), 'nl')
      should.equal(i18nWithDefault.__('greeting.formal'), 'Hello')

      i18nWithDefault.setLocale('en')
      should.equal(i18nWithDefault.getLocale(), 'en')
      should.equal(i18nWithDefault.__('greeting.formal'), 'Hello')
    })

    it('should default "en" when locale is set to unconfigured value', () => {
      i18nWithDefault.setLocale('sv')
      should.equal(i18nWithDefault.getLocale(), 'en')
      should.equal(i18nWithDefault.__('greeting.formal'), 'Hello')
    })

    it('should work multple times (not set wrong cache)', () => {
      i18nWithDefault.setLocale('nl')
      for (let i = 0; i <= 5; i += 1) {
        should.equal(
          i18nWithDefault.__('greeting.formal'),
          'Hello',
          'Fail on ' + i + ' interation'
        )
      }
    })

    it('should set cache to work fast', () => {
      i18nWithDefault.setLocale('nl')
      i18nWithDefault.__('greeting.formal')
      should.equal(i18nWithDefault.getCatalog('nl').greeting.formal, 'Hello')
    })
  })

  describe('singular without retryInDefaultLocale', () => {
    it('should english translation for missing key', () => {
      i18nNoDefault.setLocale('nl')
      should.equal(i18nNoDefault.getLocale(), 'nl')
      should.equal(i18nNoDefault.__('greeting.formal'), 'greeting.formal')

      i18nNoDefault.setLocale('en')
      should.equal(i18nNoDefault.getLocale(), 'en')
      should.equal(i18nNoDefault.__('greeting.formal'), 'Hello')
    })

    it('should default "en" when locale is set to unconfigured value', () => {
      i18nNoDefault.setLocale('sv')
      should.equal(i18nNoDefault.getLocale(), 'en')
      should.equal(i18nNoDefault.__('greeting.formal'), 'Hello')
    })

    it('should work multple times (not set wrong cache)', () => {
      i18nNoDefault.setLocale('nl')
      for (let i = 0; i <= 5; i += 1) {
        should.equal(
          i18nNoDefault.__('greeting.formal'),
          'greeting.formal',
          'Fail on ' + i + ' interation'
        )
      }
    })

    it('should set cache to work fast', () => {
      i18nNoDefault.setLocale('nl')
      i18nNoDefault.__('greeting.formal')
      should.equal(
        i18nNoDefault.getCatalog('nl').greeting.formal,
        'greeting.formal'
      )
    })
  })

  describe('plural with retryInDefaultLocale enabled', () => {
    it('should use translations from defaultLocale for missing key', () => {
      i18nWithDefault.setLocale('nl')
      should.equal(i18nWithDefault.getLocale(), 'nl')
      should.equal(i18nWithDefault.__n('%s star', 1), '1 star')
      should.equal(i18nWithDefault.__n('%s star', 3), '3 stars')

      i18nWithDefault.setLocale('en')
      should.equal(i18nWithDefault.getLocale(), 'en')
      should.equal(i18nWithDefault.__n('%s star', 1), '1 star')
      should.equal(i18nWithDefault.__n('%s star', 3), '3 stars')
    })

    it('should default "en" when locale is set to unconfigured value', () => {
      i18nWithDefault.setLocale('sv')
      should.equal(i18nWithDefault.getLocale(), 'en')
      should.equal(i18nWithDefault.__n('%s star', 1), '1 star')
      should.equal(i18nWithDefault.__n('%s star', 3), '3 stars')
    })

    it('should work multple times (not set wrong cache)', () => {
      i18nWithDefault.setLocale('nl')
      for (let i = 0; i <= 5; i += 1) {
        should.equal(
          i18nWithDefault.__n('%s star', 3),
          '3 stars',
          'Fail on ' + i + ' interation'
        )
      }
    })

    it('should set cache to work fast', () => {
      i18nWithDefault.setLocale('nl')
      should.equal(i18nWithDefault.__n('%s star', 3), '3 stars')
      should.deepEqual(i18nWithDefault.getCatalog('nl')['%s star'], {
        one: '%s star',
        other: '%s stars'
      })
    })
  })

  describe('plural without retryInDefaultLocale enabled', () => {
    it('should use translations from defaultLocale for missing key', () => {
      i18nNoDefault.setLocale('nl')
      should.equal(i18nNoDefault.getLocale(), 'nl')
      should.equal(i18nNoDefault.__n('%s star', 1), '1 star')
      should.equal(i18nNoDefault.__n('%s star', 3), '3 star')

      i18nNoDefault.setLocale('en')
      should.equal(i18nNoDefault.getLocale(), 'en')
      should.equal(i18nNoDefault.__n('%s star', 1), '1 star')
      should.equal(i18nNoDefault.__n('%s star', 3), '3 stars')
    })

    it('should default "en" when locale is set to unconfigured value', () => {
      i18nNoDefault.setLocale('sv')
      should.equal(i18nNoDefault.getLocale(), 'en')
      should.equal(i18nNoDefault.__n('%s star', 1), '1 star')
      should.equal(i18nNoDefault.__n('%s star', 3), '3 stars')
    })

    it('should work multple times (not set wrong cache)', () => {
      i18nNoDefault.setLocale('nl')
      for (let i = 0; i <= 5; i += 1) {
        should.equal(
          i18nNoDefault.__n('%s star', 3),
          '3 star',
          'Fail on ' + i + ' interation'
        )
      }
    })

    it('should set cache to work fast', () => {
      i18nNoDefault.setLocale('nl')
      should.equal(i18nNoDefault.__n('%s star', 3), '3 star')
      should.deepEqual(i18nNoDefault.getCatalog('nl')['%s star'], {
        one: '%s star',
        other: '%s star'
      })
    })
  })
})
