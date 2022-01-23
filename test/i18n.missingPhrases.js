/* global __ */

const i18n = require('..')
const should = require('should')

describe('Missing Phrases', () => {
  beforeEach(() => {
    i18n.configure({
      locales: ['en', 'de'],
      fallbacks: { nl: 'de' },
      directory: './locales',
      updateFiles: false,
      syncFiles: false
    })
  })

  describe('Local Module API', () => {
    const req = {
      request: 'GET /test',
      __: i18n.__,
      __n: i18n.__n,
      locale: {},
      headers: {}
    }

    describe('i18nTranslate', () => {
      it('should return the key if the translation does not exist', (done) => {
        i18n.configure({
          locales: ['en', 'de', 'en-GB'],
          defaultLocale: 'en',
          directory: './locales',
          register: req,
          updateFiles: false,
          syncFiles: false
        })

        i18n.setLocale(req, 'en').should.equal('en')
        req.__('DoesNotExist').should.equal('DoesNotExist')
        done()
      })

      it('should return a custom key if a missing key function is provided', (done) => {
        i18n.configure({
          locales: ['en', 'de', 'en-GB'],
          defaultLocale: 'en',
          directory: './locales',
          register: req,
          updateFiles: false,
          syncFiles: false,
          missingKeyFn: (locale, value) => 'DoesReallyNotExist'
        })

        i18n.setLocale(req, 'en').should.equal('en')
        req.__n('DoesNotExist.sss.xxx').should.equal('DoesReallyNotExist')
        done()
      })
    })
  })

  describe('Global Module API', () => {
    describe('i18nTranslate', () => {
      it('should return the key if the translation does not exist', () => {
        i18n.configure({
          locales: ['en', 'de', 'en-GB'],
          defaultLocale: 'en',
          directory: './locales',
          register: global,
          updateFiles: false,
          syncFiles: false
        })

        i18n.setLocale('en')
        should.equal(__('DoesNotExist'), 'DoesNotExist')
      })

      it('should return a custom key if a missing key function is provided', () => {
        i18n.configure({
          locales: ['en', 'de', 'en-GB'],
          defaultLocale: 'en',
          directory: './locales',
          register: global,
          updateFiles: false,
          syncFiles: false,
          missingKeyFn: (locale, value) => 'DoesReallyNotExist'
        })

        i18n.setLocale('en')
        should.equal(__('DoesNotExist'), 'DoesReallyNotExist')
      })
    })
  })
})
