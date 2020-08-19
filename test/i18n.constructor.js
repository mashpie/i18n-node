const { I18n } = require('..')
const i18n = require('..')
const should = require('should')

const testApi = (instance) => {
  should.equal(typeof instance.configure, 'function')
  should.equal(typeof instance.init, 'function')
  should.equal(typeof instance.__, 'function')
  should.equal(typeof instance.__mf, 'function')
  should.equal(typeof instance.__l, 'function')
  should.equal(typeof instance.__h, 'function')
  should.equal(typeof instance.__n, 'function')
  should.equal(typeof instance.setLocale, 'function')
  should.equal(typeof instance.getLocale, 'function')
  should.equal(typeof instance.getCatalog, 'function')
  should.equal(typeof instance.getLocales, 'function')
  should.equal(typeof instance.addLocale, 'function')
  should.equal(typeof instance.removeLocale, 'function')
}

describe('exported constructor', function () {
  it('should setup independend instances', function () {
    const one = new I18n()
    const two = new I18n()
    one.configure({
      locales: ['fr'],
      updateFiles: false
    })
    two.configure({
      locales: ['en', 'ru'],
      updateFiles: false
    })
    should.deepEqual(one.getLocales(), ['fr'])
    should.deepEqual(two.getLocales(), ['en', 'ru'])
    testApi(one)
    testApi(two)
  })

  it('should setup independend instances configured on creation', function () {
    const one = new I18n({
      locales: ['en-GB'],
      updateFiles: false
    })
    const two = new I18n({
      locales: ['ru'],
      updateFiles: false
    })
    should.deepEqual(one.getLocales(), ['en-GB'])
    should.deepEqual(two.getLocales(), ['ru'])
    testApi(one)
    testApi(two)
  })
})

describe('classic require', function () {
  it('should expose all API methods', function () {
    testApi(i18n)
  })

  it('should expose constructor too', function () {
    should.equal(typeof i18n.I18n, 'function')
  })
})

describe('included constructor', function () {
  it('should setup independend instances', function () {
    const one = new i18n.I18n()
    const two = new i18n.I18n()
    one.configure({
      locales: ['fr'],
      updateFiles: false
    })
    two.configure({
      locales: ['en', 'ru'],
      updateFiles: false
    })
    should.deepEqual(one.getLocales(), ['fr'])
    should.deepEqual(two.getLocales(), ['en', 'ru'])
    testApi(one)
    testApi(two)
  })

  it('should setup independend instances configured on creation', function () {
    const one = new i18n.I18n({
      locales: ['en-GB'],
      updateFiles: false
    })
    const two = new i18n.I18n({
      locales: ['ru'],
      updateFiles: false
    })
    should.deepEqual(one.getLocales(), ['en-GB'])
    should.deepEqual(two.getLocales(), ['ru'])
    testApi(one)
    testApi(two)
  })
})
