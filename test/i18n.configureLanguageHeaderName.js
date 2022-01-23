const { I18n } = require('..')
require('should')

describe('Locale switching should work when set via custom header', () => {
  const i18n = new I18n({
    locales: ['en', 'de', 'fr'],
    defaultLocale: 'en',
    header: 'x-culture',
    directory: './locales',
    updateFiles: false,
    objectNotation: true
  })

  const reqFr = {
    request: 'GET /test',
    url: '/test',
    headers: {
      'accept-language': 'de',
      'x-culture': 'fr'
    }
  }

  const reqSv = { ...reqFr, headers: { 'x-culture': 'sv' } }

  const res = {
    locals: {}
  }

  it('getLocale should return same locale for req and res based on custom header', () => {
    i18n.init(reqFr, res)
    i18n.getLocale(reqFr).should.equal('fr')
    i18n.getLocale(res).should.equal('fr')

    reqFr.getLocale().should.equal('fr')
    res.getLocale().should.equal('fr')
    res.locals.getLocale().should.equal('fr')

    reqFr.__('Hello').should.equal('Bonjour')
    res.__('Hello').should.equal('Bonjour')
    res.locals.__('Hello').should.equal('Bonjour')
  })

  it('getLocale should fallback to defaultLocale with custom header set to unsupported locale', () => {
    i18n.init(reqSv, res)
    i18n.getLocale(reqSv).should.equal('en')
    i18n.getLocale(res).should.equal('en')

    reqSv.getLocale().should.equal('en')
    res.getLocale().should.equal('en')
    res.locals.getLocale().should.equal('en')

    reqSv.__('Hello').should.equal('Hello')
    res.__('Hello').should.equal('Hello')
    res.locals.__('Hello').should.equal('Hello')
  })
})
