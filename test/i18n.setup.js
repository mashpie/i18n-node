const i18n = require('..')
const pkgVersion = require('../package.json').version
const should = require('should')

i18n.configure({
  locales: ['en', 'de'],
  fallbacks: { nl: 'de' },
  directory: './locales',
  register: global
})

describe('Module Setup', () => {
  it('should export a valid version', () => {
    should.equal(i18n.version, pkgVersion)
  })

  it('should export configure as i18nConfigure', () => {
    should.equal(typeof i18n.configure, 'function')
    should.equal(i18n.configure.name, 'i18nConfigure')
  })

  it('should export init as i18nInit', () => {
    should.equal(typeof i18n.init, 'function')
    should.equal(i18n.init.name, 'i18nInit')
  })

  it('should export __ as i18nTranslate', () => {
    should.equal(typeof i18n.__, 'function')
    should.equal(i18n.__.name, 'i18nTranslate')
  })

  it('should export __n as i18nTranslatePlural', () => {
    should.equal(typeof i18n.__n, 'function')
    should.equal(i18n.__n.name, 'i18nTranslatePlural')
  })

  it('should export setLocale as i18nSetLocale', () => {
    should.equal(typeof i18n.setLocale, 'function')
    should.equal(i18n.setLocale.name, 'i18nSetLocale')
  })

  it('should export getLocale as i18nGetLocale', () => {
    should.equal(typeof i18n.getLocale, 'function')
    should.equal(i18n.getLocale.name, 'i18nGetLocale')
  })

  it('should export getCatalog as i18nGetCatalog', () => {
    should.equal(typeof i18n.getCatalog, 'function')
    should.equal(i18n.getCatalog.name, 'i18nGetCatalog')
  })

  it('should export addLocale as i18nAddLocale', () => {
    should.equal(typeof i18n.addLocale, 'function')
    should.equal(i18n.addLocale.name, 'i18nAddLocale')
  })

  it('should export removeLocale as i18nRemoveLocale', () => {
    should.equal(typeof i18n.removeLocale, 'function')
    should.equal(i18n.removeLocale.name, 'i18nRemoveLocale')
  })
})
