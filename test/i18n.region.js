var i18n = require('./i18n');
var should = require("should");

var req = {
  "request": "GET /test",
  __: i18n.__,
  __n: i18n.__n,
  "locale": {}
};

i18n.configure({
    locales:['en', 'de', 'zh-tw'],
    defaultLocale: 'en',
    supportRegion: true,
    directory: './locales',
    register: req
});

describe('Region Support Enabled', function () {
  describe('i18nSetLocale and i18nGetLocale', function () {
    it('do not have en-us, so use same language en', function () {
      i18n.setLocale(req, 'en-us').should.equal('en');
    });
    it('do not find any locale, should return previous locale', function () {
      i18n.setLocale(req, 'ja').should.equal('en');
    });
    it('get current locale, should return en', function () {
      i18n.getLocale(req).should.equal('en');
    });
    it('do not have zh, but auto generate by zh-tw', function () {
      i18n.setLocale(req, 'zh').should.equal('zh');
    });
    it('do not have zh-cn, should return zh', function () {
      i18n.setLocale(req, 'zh-cn').should.equal('zh');
    });
    it('get current locale, should return zh', function () {
      i18n.getLocale(req).should.equal('zh');
    });
  });
});
