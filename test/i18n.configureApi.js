const { I18n } = require('..')
const should = require('should')

describe('configure api', function () {
  it('should set an alias method on the object', function () {
    var customObject = {}
    I18n({
      locales: ['en', 'de'],
      register: customObject,
      api: {
        __: 't'
      }
    })
    should.equal(typeof customObject.t, 'function')
    should.equal(customObject.t('Hello'), 'Hello')
    customObject.setLocale('de')
    should.equal(customObject.t('Hello'), 'Hallo')
  })

  it('should work for any existing API method', function () {
    var customObject = {}
    I18n({
      locales: ['en', 'de'],
      register: customObject,
      api: {
        getLocale: 'getLocaleAlias'
      }
    })
    should.equal(typeof customObject.getLocaleAlias, 'function')
    customObject.setLocale('de')
    should.equal(customObject.getLocaleAlias(), 'de')
  })

  it('should ignore non existing API methods', function () {
    var customObject = {}
    I18n({
      locales: ['en', 'de'],
      register: customObject,
      api: {
        nonExistingMethod: 'alias'
      }
    })
    should.equal(typeof customObject.nonExistingMethod, 'undefined')
  })

  it('should not expose the actual API methods', function () {
    var customObject = {}
    I18n({
      locales: ['en', 'de'],
      register: customObject,
      api: {
        __: 't'
      }
    })
    should.equal(typeof customObject.__, 'undefined')
  })

  it('should escape res -> locals -> res recursion', function () {
    var customObject = {}
    customObject.locals = { res: customObject }
    I18n({
      locales: ['en', 'de'],
      register: customObject,
      api: {
        __: 't'
      }
    })
    should.equal(typeof customObject.t, 'function')
    should.equal(typeof customObject.locals.t, 'function')
  })
})
