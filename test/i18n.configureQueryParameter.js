var i18n = require('../i18n'),
  should = require("should"),
  path = require("path"),
  extensions = require('./extensions');

extensions.forEach(function(extension) {

  describe('Locale switching should work queryParameter use '+extension, function() {

    var req;
    var res;

    beforeEach(function() {

      i18n.configure({
        locales: ['en', 'de', 'fr'],
        defaultLocale: 'en',
        queryParameter: 'lang',
        cookiename: 'languageCookie',
        directory: './locales',
        extension: extension
      });

      req = {
        request: "GET /test?lang=fr",
        url: "/test?lang=fr",
        headers: {
          'accept-language': 'de'
        },
        cookies:{
          'languageCookie':'de'
        }
      };

      res = {
        locals: {}
      };
    });

    it('getLocale should return same locale for req and res based on ?lang=fr', function() {
      i18n.init(req, res);

      i18n.getLocale(req).should.equal('fr');
      i18n.getLocale(res).should.equal('fr');

      req.getLocale().should.equal('fr');
      res.getLocale().should.equal('fr');
      res.locals.getLocale().should.equal('fr');

      req.__('Hello').should.equal('Bonjour');
      res.__('Hello').should.equal('Bonjour');
      res.locals.__('Hello').should.equal('Bonjour');
    });
  });
});
