const i18n = require('..')
const should = require('should')
const sinon = require('sinon')

describe('i18n.init()', function () {
  let TestScope
  let UnboundTestScope
  let UnboundTestScopeWithLocale
  let TestRequest
  let TestResponse
  let next

  beforeEach(function () {
    TestScope = {
      scope: {
        locale: 'de'
      }
    }
    UnboundTestScope = {
      scope: {
        locale: 'de'
      }
    }
    UnboundTestScopeWithLocale = {
      locale: 'de'
    }
    TestRequest = {
      headers: {
        'accept-language': 'de'
      }
    }
    TestResponse = {}
    next = sinon.spy()
    i18n.configure({
      locales: ['de', 'en'],
      directory: './locales',
      register: TestScope,
      updateFiles: false,
      syncFiles: false
    })
  })

  it('should break silently when called without parameters', function (done) {
    should.equal(i18n.init(), undefined)
    should.equal(TestScope.__('Hello'), 'Hello')
    done()
  })

  it('should break when called without parameters', function (done) {
    should.equal(i18n.init(TestRequest, TestResponse, next), undefined)
    should.equal(TestScope.locale, 'de')
    should.equal(next.called, true)
    should.equal(TestScope.__('Hello'), 'Hallo')
    done()
  })

  it('should be possible to bind to non-request objects', function (done) {
    const plain = {}
    should.equal(i18n.init(plain), undefined)
    should.equal(plain.locale, 'en')
    should.equal(plain.__('Hello'), 'Hello')
    should.equal(plain.setLocale('de'), 'de')
    should.equal(plain.__('Hello'), 'Hallo')
    done()
  })

  it('should be possible to bind public methods to foreign objects', function (done) {
    UnboundTestScope.translate = i18n.__
    should.equal(UnboundTestScope.translate('Hello'), 'Hallo')

    UnboundTestScopeWithLocale.translate = i18n.__
    should.equal(UnboundTestScopeWithLocale.translate('Hello'), 'Hallo')
    done()
  })
})
