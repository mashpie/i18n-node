var i18n = require('../i18n'),
  should = require("should"),
  path = require("path");

describe('Locale switching should work on req and res', function() {

  var req;
  var res;

  beforeEach(function() {

    i18n.configure({
      locales: ['en', 'de', 'fr'],
      defaultLocale: 'en',
      directory: './locales'
    });

    req = {
      request: "GET /test",
      headers: {
        'accept-language': 'de'
      }
    };

    res = {};

  });

  it('getLocale should return same locale for req and res without any setLocale switch', function() {
    i18n.init(req, res);

    i18n.getLocale(req).should.equal('de');
    i18n.getLocale(res).should.equal('de');

    req.getLocale().should.equal('de');
    res.getLocale().should.equal('de');
  });

  it('i18n.setLocale(req) should switch locale for req only', function() {
    i18n.init(req, res);

    i18n.setLocale(req, 'fr');

    i18n.getLocale(req).should.equal('fr');
    i18n.getLocale(res).should.equal('de');

    req.getLocale().should.equal('fr');
    res.getLocale().should.equal('de');

    req.__('Hello').should.equal('Bonjour');
    res.__('Hello').should.equal('Hallo');
  });

  it('req.setLocale() should switch locale for req only (alternative notation)', function() {
    i18n.init(req, res);

    req.setLocale('fr');

    i18n.getLocale(req).should.equal('fr');
    i18n.getLocale(res).should.equal('de');

    req.getLocale().should.equal('fr');
    res.getLocale().should.equal('de');

    req.__('Hello').should.equal('Bonjour');
    res.__('Hello').should.equal('Hallo');
  });

  it('i18n.setLocale(res) should switch locale for res only', function() {
    i18n.init(req, res);

    i18n.setLocale(res, 'fr');

    i18n.getLocale(req).should.equal('de');
    i18n.getLocale(res).should.equal('fr');

    req.getLocale().should.equal('de');
    res.getLocale().should.equal('fr');

    req.__('Hello').should.equal('Hallo');
    res.__('Hello').should.equal('Bonjour');
  });

  it('res.setLocale() should switch locale for res only (alternative notation)', function() {
    i18n.init(req, res);

    res.setLocale('fr');

    i18n.getLocale(req).should.equal('de');
    i18n.getLocale(res).should.equal('fr');

    req.getLocale().should.equal('de');
    res.getLocale().should.equal('fr');

    req.__('Hello').should.equal('Hallo');
    res.__('Hello').should.equal('Bonjour');
  });

  it('setLocale() should switch locale for req and res implicitly', function() {
    // add res to req to simulate express 4.x schema
    req.res = res;
    i18n.init(req, res);
    req.setLocale('fr');

    i18n.getLocale(req).should.equal('fr');
    i18n.getLocale(res).should.equal('fr');

    req.getLocale().should.equal('fr');
    res.getLocale().should.equal('fr');

    req.__('Hello').should.equal('Bonjour');
    res.__('Hello').should.equal('Bonjour');
  });

  it('setLocale() should switch locale for req and res implicitly (alternative notation)', function() {
    // add res to req to simulate express 4.x schema
    req.res = res;
    i18n.init(req, res);
    i18n.setLocale(req, 'fr');

    i18n.getLocale(req).should.equal('fr');
    i18n.getLocale(res).should.equal('fr');

    req.getLocale().should.equal('fr');
    res.getLocale().should.equal('fr');

    req.__('Hello').should.equal('Bonjour');
    res.__('Hello').should.equal('Bonjour');
  });

  it('setLocale() should switch locale for req, res and res.locals implicitly', function() {
    // add locals to res
    res.locals = {};

    // add res to req to simulate express 4.x schema
    req.res = res;
    i18n.init(req, res);
    i18n.setLocale(req, 'fr');

    i18n.getLocale(req).should.equal('fr');
    i18n.getLocale(res).should.equal('fr');
    i18n.getLocale(res.locals).should.equal('fr');

    req.getLocale().should.equal('fr');
    res.getLocale().should.equal('fr');
    res.locals.getLocale().should.equal('fr');

    req.__('Hello').should.equal('Bonjour');
    res.__('Hello').should.equal('Bonjour');
    res.locals.__('Hello').should.equal('Bonjour');
  });

  it('setLocale() should switch locale for req, res and res.locals implicitly when set on req', function() {
    // add locals to res
    res.locals = {};

    // add res to req to simulate express 4.x schema
    req.res = res;
    i18n.init(req, res);
    req.setLocale('fr');

    i18n.getLocale(req).should.equal('fr');
    i18n.getLocale(res).should.equal('fr');
    i18n.getLocale(res.locals).should.equal('fr');

    req.getLocale().should.equal('fr');
    res.getLocale().should.equal('fr');
    res.locals.getLocale().should.equal('fr');

    req.__('Hello').should.equal('Bonjour');
    res.__('Hello').should.equal('Bonjour');
    res.locals.__('Hello').should.equal('Bonjour');
  });

  it('setLocale() should switch locale for req, res and res.locals implicitly when set on res', function() {
    // add locals to res
    res.locals = {};

    // add res to req to simulate express 4.x schema
    req.res = res;
    i18n.init(req, res);
    res.setLocale('fr');

    i18n.getLocale(req).should.equal('de');
    i18n.getLocale(res).should.equal('fr');
    i18n.getLocale(res.locals).should.equal('fr');

    req.getLocale().should.equal('de');
    res.getLocale().should.equal('fr');
    res.locals.getLocale().should.equal('fr');

    req.__('Hello').should.equal('Hallo');
    res.__('Hello').should.equal('Bonjour');
    res.locals.__('Hello').should.equal('Bonjour');
  });

  it('setLocale() should switch locale for req, res and res.locals implicitly when set on res.locals', function() {
    // add locals to res
    res.locals = {};

    // add res to req to simulate express 4.x schema
    req.res = res;
    i18n.init(req, res);
    res.locals.setLocale('fr');

    i18n.getLocale(req).should.equal('de');
    i18n.getLocale(res).should.equal('de');
    i18n.getLocale(res.locals).should.equal('fr');

    req.getLocale().should.equal('de');
    res.getLocale().should.equal('de');
    res.locals.getLocale().should.equal('fr');

    req.__('Hello').should.equal('Hallo');
    res.__('Hello').should.equal('Hallo');
    res.locals.__('Hello').should.equal('Bonjour');
  });


  it('setLocale() should switch locale for req, res and res.locals implicitly when set as array', function() {
    // add locals to res
    res.locals = {};

    // add res to req to simulate express 4.x schema
    req.res = res;
    i18n.init(req, res);
    i18n.setLocale([req, res, res.locals], 'fr');

    i18n.getLocale(req).should.equal('fr');
    i18n.getLocale(res).should.equal('fr');
    i18n.getLocale(res.locals).should.equal('fr');

    req.getLocale().should.equal('fr');
    res.getLocale().should.equal('fr');
    res.locals.getLocale().should.equal('fr');

    req.__('Hello').should.equal('Bonjour');
    res.__('Hello').should.equal('Bonjour');
    res.locals.__('Hello').should.equal('Bonjour');
  });


  it('setLocale(object) should escape res -> locals -> res recursion', function() {
    // add locals to res
    res.locals = { res: res };

    // add res to req to simulate express 4.x schema
    req.res = res;
    i18n.init(req, res);
    i18n.setLocale(req, 'fr');

    res.locale.should.equal('fr');
    res.locals.locale.should.equal('fr');
  });

});