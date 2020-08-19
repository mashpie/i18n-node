const { I18n } = require('..')

describe('Fallbacks', function () {
  let i18n = new I18n()
  var req = {
    request: 'GET /test',
    __: i18n.__,
    __n: i18n.__n,
    locale: {},
    headers: {}
  }

  describe('Fallback to language', function () {
    beforeEach(function () {
      i18n.configure({
        locales: ['en', 'de', 'fr'],
        defaultLocale: 'en',
        fallbacks: { foo: 'de', 'de-AT': 'de', 'fr-*': 'fr' },
        directory: './locales',
        register: req
      })

      req.headers = {}
      delete req.languages
      delete req.language
      delete req.locale
      delete req.region
      delete req.regions
    })

    it('should fall back to "de" for language "foo"', function () {
      req.headers['accept-language'] = 'foo'
      i18n.init(req)
      i18n.getLocale(req).should.equal('de')
    })
    it('should fall back to "de" for language "foo-BAR"', function () {
      req.headers['accept-language'] = 'foo-BAR'
      i18n.init(req)
      i18n.getLocale(req).should.equal('de')
    })
    it('should fall back to "de" for locale "de-AT"', function () {
      req.headers['accept-language'] = 'de-AT'
      i18n.init(req)
      i18n.getLocale(req).should.equal('de')
    })
    it('should fall back to "fr" for locale "fr-CA"', function () {
      req.headers['accept-language'] = 'fr-CA'
      i18n.init(req)
      i18n.getLocale(req).should.equal('fr')
    })
    it('should fall back to "de" for second-order locale "de-AT"', function () {
      req.headers['accept-language'] = 'de-DK,de-AT'
      i18n.init(req)
      i18n.getLocale(req).should.equal('de')
    })
    it('should fall back to "fr" for second-order locale "fr-CA"', function () {
      req.headers['accept-language'] = 'de-DK,fr-CA,de-AT'
      i18n.init(req)
      i18n.getLocale(req).should.equal('fr')
    })
    it('should use default "en" for valid locale request (ignoring fallbacks)', function () {
      req.headers['accept-language'] = 'en-US,en,de-DK,de-AT'
      i18n.init(req)
      i18n.getLocale(req).should.equal('en')
    })
  })

  describe('Fallback to parent language with weighted Accept-Language header', function () {
    beforeEach(function () {
      i18n.configure({
        locales: ['en-US', 'tr-TR'],
        defaultLocale: 'en-US',
        fallbacks: { en: 'en-US', tr: 'tr-TR' },
        directory: './locales',
        register: req
      })

      req.headers = {}
      delete req.languages
      delete req.language
      delete req.locale
      delete req.region
      delete req.regions
    })
    it('should use "tr-TR" from fallback for "tr" instead of "en-US" parent of "en-CA"', function () {
      req.headers['accept-language'] = 'en-CA,tr;q=0.3'
      i18n.init(req)
      i18n.getLocale(req).should.equal('tr-TR')
    })
    it('should use "en-US" from fallback for "en" parent language with "en" in Accept-Language', function () {
      req.headers['accept-language'] = 'en-CA,en;q=0.7,tr;q=0.3'
      i18n.init(req)
      i18n.getLocale(req).should.equal('en-US')
    })
    it('should use "tr-TR" from fallback for "tr"', function () {
      req.headers['accept-language'] = 'fr-FR,fr;q=0.7,tr;q=0.3'
      i18n.init(req)
      i18n.getLocale(req).should.equal('tr-TR')
    })
  })

  describe('Fallback to locale', function () {
    beforeEach(function () {
      i18n = new I18n({
        locales: ['en-US', 'de-DE', 'fr-CA'],
        defaultLocale: 'en-US',
        fallbacks: { de: 'de-DE', 'fr*': 'fr-CA' },
        directory: './locales',
        register: req
      })
      req.headers = {}
      delete req.languages
      delete req.language
      delete req.locale
      delete req.region
      delete req.regions
    })

    it('should fall back to "de-DE" for language "de-AT"', function () {
      req.headers['accept-language'] = 'de-AT'
      i18n.init(req)
      i18n.getLocale(req).should.equal('de-DE')
    })
    it('should fall back to "de-DE" for language "de"', function () {
      req.headers['accept-language'] = 'de'
      i18n.init(req)
      i18n.getLocale(req).should.equal('de-DE')
    })
    it('should fall back to "fr-CA" for language "fr"', function () {
      req.headers['accept-language'] = 'fr'
      i18n.init(req)
      i18n.getLocale(req).should.equal('fr-CA')
    })
  })

  describe('Keep valid locale', function () {
    beforeEach(function () {
      i18n = new I18n({
        locales: ['de-AT', 'de-DE'],
        defaultLocale: 'en-DE',
        fallbacks: { de: 'de-DE' },
        directory: './locales',
        register: global
      })
      req.headers = {}
      delete req.languages
      delete req.language
      delete req.locale
      delete req.region
      delete req.regions
    })

    it('should fall back to "de-DE" for language "de-SK"', function () {
      req.headers['accept-language'] = 'de-SK'
      i18n.init(req)
      i18n.getLocale(req).should.equal('de-DE')
    })
    it('should NOT fall back to "de-DE" for language "de-AT"', function () {
      req.headers['accept-language'] = 'de-AT'
      i18n.init(req)
      i18n.getLocale(req).should.equal('de-AT')
    })
  })
})
