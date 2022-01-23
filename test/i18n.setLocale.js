const i18n = require('..')
require('should')

describe('Locale switching should work on req and res', () => {
  let req
  let res

  beforeEach(() => {
    i18n.configure({
      locales: ['en', 'de', 'fr'],
      defaultLocale: 'en',
      directory: './locales'
    })

    req = {
      request: 'GET /test',
      headers: {
        'accept-language': 'de'
      }
    }

    res = {}
  })

  it('getLocale should return same locale for req and res without any setLocale switch', () => {
    i18n.init(req, res)

    i18n.getLocale(req).should.equal('de')
    i18n.getLocale(res).should.equal('de')

    req.getLocale().should.equal('de')
    res.getLocale().should.equal('de')
  })

  it('i18n.setLocale(req) should switch locale for req only', () => {
    i18n.init(req, res)

    i18n.setLocale(req, 'fr')

    i18n.getLocale(req).should.equal('fr')
    i18n.getLocale(res).should.equal('de')

    req.getLocale().should.equal('fr')
    res.getLocale().should.equal('de')

    req.__('Hello').should.equal('Bonjour')
    res.__('Hello').should.equal('Hallo')
  })

  it('req.setLocale() should switch locale for req only (alternative notation)', () => {
    i18n.init(req, res)

    req.setLocale('fr')

    i18n.getLocale(req).should.equal('fr')
    i18n.getLocale(res).should.equal('de')

    req.getLocale().should.equal('fr')
    res.getLocale().should.equal('de')

    req.__('Hello').should.equal('Bonjour')
    res.__('Hello').should.equal('Hallo')
  })

  it('i18n.setLocale(res) should switch locale for res only', () => {
    i18n.init(req, res)

    i18n.setLocale(res, 'fr')

    i18n.getLocale(req).should.equal('de')
    i18n.getLocale(res).should.equal('fr')

    req.getLocale().should.equal('de')
    res.getLocale().should.equal('fr')

    req.__('Hello').should.equal('Hallo')
    res.__('Hello').should.equal('Bonjour')
  })

  it('res.setLocale() should switch locale for res only (alternative notation)', () => {
    i18n.init(req, res)

    res.setLocale('fr')

    i18n.getLocale(req).should.equal('de')
    i18n.getLocale(res).should.equal('fr')

    req.getLocale().should.equal('de')
    res.getLocale().should.equal('fr')

    req.__('Hello').should.equal('Hallo')
    res.__('Hello').should.equal('Bonjour')
  })

  it('setLocale() should switch locale for req and res implicitly', () => {
    // add res to req to simulate express 4.x schema
    req.res = res
    i18n.init(req, res)
    req.setLocale('fr')

    i18n.getLocale(req).should.equal('fr')
    i18n.getLocale(res).should.equal('fr')

    req.getLocale().should.equal('fr')
    res.getLocale().should.equal('fr')

    req.__('Hello').should.equal('Bonjour')
    res.__('Hello').should.equal('Bonjour')
  })

  it('setLocale() should switch locale for req and res implicitly (alternative notation)', () => {
    // add res to req to simulate express 4.x schema
    req.res = res
    i18n.init(req, res)
    i18n.setLocale(req, 'fr')

    i18n.getLocale(req).should.equal('fr')
    i18n.getLocale(res).should.equal('fr')

    req.getLocale().should.equal('fr')
    res.getLocale().should.equal('fr')

    req.__('Hello').should.equal('Bonjour')
    res.__('Hello').should.equal('Bonjour')
  })

  it('setLocale() should switch locale for req, res and res.locals implicitly', () => {
    // add locals to res
    res.locals = {}

    // add res to req to simulate express 4.x schema
    req.res = res
    i18n.init(req, res)
    i18n.setLocale(req, 'fr')

    i18n.getLocale(req).should.equal('fr')
    i18n.getLocale(res).should.equal('fr')
    i18n.getLocale(res.locals).should.equal('fr')

    req.getLocale().should.equal('fr')
    res.getLocale().should.equal('fr')
    res.locals.getLocale().should.equal('fr')

    req.__('Hello').should.equal('Bonjour')
    res.__('Hello').should.equal('Bonjour')
    res.locals.__('Hello').should.equal('Bonjour')
  })

  it('setLocale() should switch locale for req, res and res.locals implicitly when set on req', () => {
    // add locals to res
    res.locals = {}

    // add res to req to simulate express 4.x schema
    req.res = res
    i18n.init(req, res)
    req.setLocale('fr')

    i18n.getLocale(req).should.equal('fr')
    i18n.getLocale(res).should.equal('fr')
    i18n.getLocale(res.locals).should.equal('fr')

    req.getLocale().should.equal('fr')
    res.getLocale().should.equal('fr')
    res.locals.getLocale().should.equal('fr')

    req.__('Hello').should.equal('Bonjour')
    res.__('Hello').should.equal('Bonjour')
    res.locals.__('Hello').should.equal('Bonjour')
  })

  it('setLocale() should switch locale for req, res and res.locals implicitly when set on res', () => {
    // add locals to res
    res.locals = {}

    // add res to req to simulate express 4.x schema
    req.res = res
    i18n.init(req, res)
    res.setLocale('fr')

    i18n.getLocale(req).should.equal('de')
    i18n.getLocale(res).should.equal('fr')
    i18n.getLocale(res.locals).should.equal('fr')

    req.getLocale().should.equal('de')
    res.getLocale().should.equal('fr')
    res.locals.getLocale().should.equal('fr')

    req.__('Hello').should.equal('Hallo')
    res.__('Hello').should.equal('Bonjour')
    res.locals.__('Hello').should.equal('Bonjour')
  })

  it('setLocale() should switch locale for req, res and res.locals implicitly when set on res.locals', () => {
    // add locals to res
    res.locals = {}

    // add res to req to simulate express 4.x schema
    req.res = res
    i18n.init(req, res)
    res.locals.setLocale('fr')

    i18n.getLocale(req).should.equal('de')
    i18n.getLocale(res).should.equal('de')
    i18n.getLocale(res.locals).should.equal('fr')

    req.getLocale().should.equal('de')
    res.getLocale().should.equal('de')
    res.locals.getLocale().should.equal('fr')

    req.__('Hello').should.equal('Hallo')
    res.__('Hello').should.equal('Hallo')
    res.locals.__('Hello').should.equal('Bonjour')
  })

  it('setLocale() should switch locale for req, res and res.locals implicitly when set as array', () => {
    // add locals to res
    res.locals = {}

    // add res to req to simulate express 4.x schema
    req.res = res
    i18n.init(req, res)
    i18n.setLocale([req, res, res.locals], 'fr')

    i18n.getLocale(req).should.equal('fr')
    i18n.getLocale(res).should.equal('fr')
    i18n.getLocale(res.locals).should.equal('fr')

    req.getLocale().should.equal('fr')
    res.getLocale().should.equal('fr')
    res.locals.getLocale().should.equal('fr')

    req.__('Hello').should.equal('Bonjour')
    res.__('Hello').should.equal('Bonjour')
    res.locals.__('Hello').should.equal('Bonjour')
  })

  it('setLocale(object) should escape res -> locals -> res recursion', () => {
    // add locals to res
    res.locals = { res: res }

    // add res to req to simulate express 4.x schema
    req.res = res
    i18n.init(req, res)
    i18n.setLocale(req, 'fr')

    res.locale.should.equal('fr')
    res.locals.locale.should.equal('fr')
  })
})
