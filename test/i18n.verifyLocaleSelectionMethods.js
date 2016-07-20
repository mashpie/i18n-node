var i18n = require('../i18n'),
  should = require("should");

describe('when configuring selected locale', function () {
  var res;

  function setByQueryParam(i18n, locale) {
    var req = {
      request: 'GET /test?lang=' + locale,
      url: '/test?lang=' + locale
    };
    i18n.init(req, res);
    return i18n.getLocale(req);
  };

  function setByCookie(i18n, locale) {
    var req = {
      request: 'GET /test',
      url: '/test',
      cookies:{
        'languageCookie': locale
      }
    };

    i18n.init(req, res);
    return i18n.getLocale(req);
  };

  function setByHeader(i18n, locale) {
    var req = {
      request: 'GET /test',
      url: '/test',
      headers: {
        'accept-language': locale
      }
    };
    i18n.init(req, res);
    return i18n.getLocale(req);
  };

  beforeEach(function () {
    res = { locals: {} };
    i18n.configure({
      locales: ['de-AT', 'de-DE', 'en-GB', 'tr-TR', 'en-US', 'en'],
      defaultLocale: 'default-locale',
      queryParameter: 'lang',
      cookie: 'languageCookie',
      directory: './locales',
      preserveLegacyCase: false
    });
  });


  describe('should result in the same locale whether set by cookie, queryParam, or header', function () {
    it('should work for simple language codes', function (done) {
      (setByQueryParam(i18n, 'en')).should.be.equal('en', 'when set via queryParameter');
      (setByCookie(i18n, 'en')).should.be.equal('en', 'when set via cookie');
      (setByHeader(i18n, 'en')).should.be.equal('en', 'when set via header');
      done();
    });

    it('should work for compound language codes', function (done) {
      (setByQueryParam(i18n, 'de-AT')).should.be.equal('de-AT', 'when set via queryParameter');
      (setByCookie(i18n, 'de-AT')).should.be.equal('de-AT', 'when set via cookie');
      (setByHeader(i18n, 'de-AT')).should.be.equal('de-AT', 'when set via header');
      done();
    });
  });
});
