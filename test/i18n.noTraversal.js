const fs = require('fs')
const path = require('path')
const { I18n } = require('..')
require('should')

const config = {
  locales: ['en'],
  directory: path.join(__dirname, '../locales_traversal/is/not/possible')
}
const testfile = path.join(config.directory, 'en.json')

const getJson = () => {
  return JSON.parse(fs.readFileSync(testfile))
}

describe('No directory traversal for writing', () => {
  before('cleanup assertions', () => {
    try {
      fs.unlinkSync(testfile)
    } catch (_) {}
  })

  it(`setLocale('../../foo') SHOULD write to testfile`, () => {
    const i18n = new I18n(config)
    const req = {}
    i18n.init(req)
    req.setLocale('../../foo')
    req.getLocale().should.equal('en')
    req.__('Hello setLocale').should.equal('Hello setLocale')
    getJson()['Hello setLocale'].should.equal('Hello setLocale')
  })

  it(`accept-language: '../../en-US' SHOULD write to testfile`, () => {
    const i18n = new I18n(config)
    const req = {
      headers: {
        'accept-language': '../../en-US;q=1.0;fr-FR,fr;q=0.7,tr;q=0.3'
      }
    }
    i18n.init(req)
    req.getLocale().should.equal('en')
    req.__('Hello Header 1').should.equal('Hello Header 1')
    getJson()['Hello Header 1'].should.equal('Hello Header 1')
  })

  it(`accept-language: 'en/../..' SHOULD write to testfile`, () => {
    const i18n = new I18n(config)
    const req = {
      headers: {
        'accept-language': 'en/../..;q=1.0;fr-FR,fr;q=0.7,tr;q=0.3'
      }
    }
    i18n.init(req)
    req.getLocale().should.equal('en')
    req.__('Hello Header 2').should.equal('Hello Header 2')
    getJson()['Hello Header 2'].should.equal('Hello Header 2')
  })

  it(`cookie: '../../en' SHOULD write to testfile`, () => {
    const i18n = new I18n({ ...config, cookie: 'i18nCookie' })
    const req = {
      cookies: { i18nCookie: '../../en' }
    }
    i18n.init(req)
    req.getLocale().should.equal('en')
    req.__('Hello Cookie 1').should.equal('Hello Cookie 1')
    getJson()['Hello Cookie 1'].should.equal('Hello Cookie 1')
  })

  it(`cookie: 'en/../..' SHOULD write to testfile`, () => {
    const i18n = new I18n({ ...config, cookie: 'i18nCookie' })
    const req = {
      cookies: { i18nCookie: 'en/../..' }
    }
    i18n.init(req)
    req.getLocale().should.equal('en')
    req.__('Hello Cookie 2').should.equal('Hello Cookie 2')
    getJson()['Hello Cookie 2'].should.equal('Hello Cookie 2')
  })

  it(`query: '../../en' SHOULD write to testfile`, () => {
    const i18n = new I18n({ ...config, queryParameter: 'lang' })
    const req = { url: '/test?lang=../../en' }
    i18n.init(req)
    req.getLocale().should.equal('en')
    req.__('Hello Query 1').should.equal('Hello Query 1')
    getJson()['Hello Query 1'].should.equal('Hello Query 1')
  })

  it(`query: 'en/../..' SHOULD write to testfile`, () => {
    const i18n = new I18n({ ...config, queryParameter: 'lang' })
    const req = { url: '/test?lang=en/../..' }
    i18n.init(req)
    req.getLocale().should.equal('en')
    req.__('Hello Query 2').should.equal('Hello Query 2')
    getJson()['Hello Query 2'].should.equal('Hello Query 2')
  })
})

describe('No directory traversal for reading', () => {
  before('prepare assertion', () => {
    fs.writeFileSync(testfile, `{ "Hello": "Hello from 'en.json'" }`)
  })

  it(`setLocale('../some') SHOULD read from testfile`, () => {
    const i18n = new I18n(config)
    const req = {}
    i18n.init(req)
    req.setLocale('../../foo')
    req.getLocale().should.equal('en')
    req.__('Hello').should.equal(`Hello from 'en.json'`)
  })

  it(`accept-language: '../../en-US' SHOULD read from testfile`, () => {
    const i18n = new I18n(config)
    const req = {
      headers: {
        'accept-language': '../../en-US;q=1.0;fr-FR,fr;q=0.7,tr;q=0.3'
      }
    }
    i18n.init(req)
    req.getLocale().should.equal('en')
    req.__('Hello').should.equal(`Hello from 'en.json'`)
  })

  it(`accept-language: 'en/../..' SHOULD read from testfile`, () => {
    const i18n = new I18n(config)
    const req = {
      headers: {
        'accept-language': 'en/../..;q=1.0;fr-FR,fr;q=0.7,tr;q=0.3'
      }
    }
    i18n.init(req)
    req.getLocale().should.equal('en')
    req.__('Hello').should.equal(`Hello from 'en.json'`)
  })

  it(`cookie: '../../en' SHOULD read from testfile`, () => {
    const i18n = new I18n({ ...config, cookie: 'i18nCookie' })
    const req = {
      cookies: { i18nCookie: '../../en' }
    }
    i18n.init(req)
    req.getLocale().should.equal('en')
    req.__('Hello').should.equal(`Hello from 'en.json'`)
  })

  it(`cookie: 'en/../..' SHOULD read from testfile`, () => {
    const i18n = new I18n({ ...config, cookie: 'i18nCookie' })
    const req = {
      cookies: { i18nCookie: 'en/../..' }
    }
    i18n.init(req)
    req.getLocale().should.equal('en')
    req.__('Hello').should.equal(`Hello from 'en.json'`)
  })

  it(`query: '../../en' SHOULD read from testfile`, () => {
    const i18n = new I18n({ ...config, queryParameter: 'lang' })
    const req = { url: '/test?lang=../../en' }
    i18n.init(req)
    req.getLocale().should.equal('en')
    req.__('Hello').should.equal(`Hello from 'en.json'`)
  })

  it(`query: 'en/../..' SHOULD read from testfile`, () => {
    const i18n = new I18n({ ...config, queryParameter: 'lang' })
    const req = { url: '/test?lang=en/../..' }
    i18n.init(req)
    req.getLocale().should.equal('en')
    req.__('Hello').should.equal(`Hello from 'en.json'`)
  })
})
