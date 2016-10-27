var i18n = require('../i18n'),
    should = require("should");

i18n.configure({
	locales: ['en', 'de'],
	fallbacks: {'nl': 'de'},
	directory: './locales',
	register: global
});

describe('Module Setup', function () {
  it('should export a valid version', function () {
    should.equal(i18n.version, '0.8.3');
  });

  it('should export configure as i18nConfigure', function () {
    should.equal(typeof i18n.configure, 'function');
    should.equal(i18n.configure.name, 'i18nConfigure');
  });

  it('should export init as i18nInit', function () {
    should.equal(typeof i18n.init, 'function');
    should.equal(i18n.init.name, 'i18nInit');
  });

  it('should export __ as i18nTranslate', function () {
    should.equal(typeof i18n.__, 'function');
    should.equal(i18n.__.name, 'i18nTranslate');
  });

  it('should export __n as i18nTranslatePlural', function () {
    should.equal(typeof i18n.__n, 'function');
    should.equal(i18n.__n.name, 'i18nTranslatePlural');
  });

  it('should export setLocale as i18nSetLocale', function () {
    should.equal(typeof i18n.setLocale, 'function');
    should.equal(i18n.setLocale.name, 'i18nSetLocale');
  });

  it('should export getLocale as i18nGetLocale', function () {
    should.equal(typeof i18n.getLocale, 'function');
    should.equal(i18n.getLocale.name, 'i18nGetLocale');
  });

  it('should export getCatalog as i18nGetCatalog', function () {
    should.equal(typeof i18n.getCatalog, 'function');
    should.equal(i18n.getCatalog.name, 'i18nGetCatalog');
  });

  it('should export addLocale as i18nAddLocale', function () {
    should.equal(typeof i18n.addLocale, 'function');
    should.equal(i18n.addLocale.name, 'i18nAddLocale');
  });

  it('should export removeLocale as i18nRemoveLocale', function () {
    should.equal(typeof i18n.removeLocale, 'function');
    should.equal(i18n.removeLocale.name, 'i18nRemoveLocale');
  });
});