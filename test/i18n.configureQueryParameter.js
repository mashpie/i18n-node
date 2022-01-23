const i18n = require('..')

describe('Locale switching should work queryParameter', function () {
  let req
  let res

  beforeEach(function () {
    i18n.configure({
      locales: ['en', 'de', 'fr'],
      defaultLocale: 'en',
      queryParameter: 'lang',
      cookiename: 'languageCookie',
      directory: './locales'
    })

    req = {
      request: 'GET /test?lang=fr',
      url: '/test?lang=fr',
      headers: {
        'accept-language': 'de'
      },
      cookies: {
        languageCookie: 'de'
      }
    }

    res = {
      locals: {}
    }
  })

  it('getLocale should return same locale for req and res based on ?lang=fr', function () {
    i18n.init(req, res)

    i18n.getLocale(req).should.equal('fr')
    i18n.getLocale(res).should.equal('fr')

    req.getLocale().should.equal('fr')
    res.getLocale().should.equal('fr')
    res.locals.getLocale().should.equal('fr')

    req.__('Hello').should.equal('Bonjour')
    res.__('Hello').should.equal('Bonjour')
    res.locals.__('Hello').should.equal('Bonjour')
  })

  it('should support WHATWG URL API', function () {
    req.url = new URL('/test?lang=fr', 'http://localhost')
    i18n.init(req, res)
    i18n.getLocale(req).should.equal('fr')
    i18n.getLocale(res).should.equal('fr')
  })

  it('should handle multiple query parameters', function () {
    const uriPath = '/test?lang=de&lang=fr'
    req.request = `GET ${uriPath}`
    req.url = new URL(uriPath, 'http://localhost')
    i18n.init(req, res)
    i18n.getLocale(req).should.equal('de')
    i18n.getLocale(res).should.equal('de')
  })

  it('should handle multiple query parameters, first is empty', function () {
    const uriPath = '/test?lang=&lang=de'
    req.request = `GET ${uriPath}`
    req.url = new URL(uriPath, 'http://localhost')
    i18n.init(req, res)
    i18n.getLocale(req).should.equal('de')
    i18n.getLocale(res).should.equal('de')
  })

  it('should handle multiple query parameters, repeated values', function () {
    const uriPath = '/test?lang=en&lang=en'
    req.request = `GET ${uriPath}`
    req.url = new URL(uriPath, 'http://localhost')
    i18n.init(req, res)
    i18n.getLocale(req).should.equal('en')
    i18n.getLocale(res).should.equal('en')
  })

  it('should handle empty query parameters', function () {
    const uriPath = '/test?lang='
    req.request = `GET ${uriPath}`
    req.headers = {}
    req.url = new URL(uriPath, 'http://localhost')
    i18n.init(req, res)
    i18n.getLocale(req).should.equal('en')
    i18n.getLocale(res).should.equal('en')
  })

  it('should handle empty query parameters, repeated params', function () {
    const uriPath = '/test?lang=&lang=&lang='
    req.request = `GET ${uriPath}`
    req.headers = {}
    req.url = new URL(uriPath, 'http://localhost')
    i18n.init(req, res)
    i18n.getLocale(req).should.equal('en')
    i18n.getLocale(res).should.equal('en')
  })

  it('should fall back to language header if present on empty query parameters', function () {
    const uriPath = '/test?lang='
    req.request = `GET ${uriPath}`
    req.headers = {
      'accept-language': 'fr'
    }
    req.url = new URL(uriPath, 'http://localhost')
    i18n.init(req, res)
    i18n.getLocale(req).should.equal('fr')
    i18n.getLocale(res).should.equal('fr')
  })

  it('should fall back to language header if present on empty query parameters, with repeated params', function () {
    const uriPath = '/test?lang=&lang='
    req.request = `GET ${uriPath}`
    req.headers = {
      'accept-language': 'fr'
    }
    req.url = new URL(uriPath, 'http://localhost')
    i18n.init(req, res)
    i18n.getLocale(req).should.equal('fr')
    i18n.getLocale(res).should.equal('fr')
  })
})
