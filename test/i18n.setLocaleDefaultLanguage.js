/**
 * regression test to cover
 *
 * req.setLocale("locale") sets defaultLanguage when req.locals is not defined #166
 *
 */
var i18n = require('../i18n'),
  should = require("should"),
  path = require("path");

describe('Locale switching should not modify defaultLocale on unsupported languages', function() {

  var req;
  var res;

  beforeEach(function() {

    i18n.configure({
      locales: ['de', 'en'],
      directory: './locales'
    });

    req = {
      request: "GET /test",
      headers: {
        'accept-language': 'es'
      }
    };

    res = {};

  });

  it('getLocale should return defaultLocale for req and res without any setLocale switch', function() {
    i18n.init(req, res);

    // as we don't support es i18n defaults to (yet internal en)
    i18n.getLocale(req).should.equal('en');
    i18n.getLocale(res).should.equal('en');

    // as we don't support es i18n defaults to (yet internal en)
    req.getLocale().should.equal('en');
    res.getLocale().should.equal('en');

    // as we don't support es i18n defaults to (yet internal en)
    req.__('Hello').should.equal('Hello');
    res.__('Hello').should.equal('Hello');
    i18n.__('Hello').should.equal('Hello');
  });

  it('getLocale should return defaultLocale for req and res with i18n.setLocale(req) switching to any unsupported locale', function() {
    i18n.init(req, res);

    // explicitly switch locale on req to unsuperted es
    i18n.setLocale(req, 'es');

    // as we don't support es i18n defaults to (yet internal en)
    i18n.getLocale(req).should.equal('en');
    i18n.getLocale(res).should.equal('en');

    // as we don't support es i18n defaults to (yet internal en)
    req.getLocale().should.equal('en');
    res.getLocale().should.equal('en');

    // as we don't support es i18n defaults to (yet internal en)
    req.__('Hello').should.equal('Hello');
    res.__('Hello').should.equal('Hello');
    i18n.__('Hello').should.equal('Hello');
  });

  it('getLocale should return defaultLocale for req and res with req.setLocale() switching to any unsupported locale', function() {
    i18n.init(req, res);

    // explicitly switch locale on req to unsuperted es
    req.setLocale('es');

    // as we don't support es i18n defaults to (yet internal en)
    i18n.getLocale(req).should.equal('en');
    i18n.getLocale(res).should.equal('en');

    // as we don't support es i18n defaults to (yet internal en)
    req.getLocale().should.equal('en');
    res.getLocale().should.equal('en');

    // as we don't support es i18n defaults to (yet internal en)
    req.__('Hello').should.equal('Hello');
    res.__('Hello').should.equal('Hello');
    i18n.__('Hello').should.equal('Hello');
  });

  it('getLocale should return defaultLocale for req and res with i18n.setLocale(res) switching to any unsupported locale', function() {
    i18n.init(req, res);

    // explicitly switch locale on req to unsuperted es
    i18n.setLocale(res, 'es');

    // as we don't support es i18n defaults to (yet internal en)
    i18n.getLocale(req).should.equal('en');
    i18n.getLocale(res).should.equal('en');

    // as we don't support es i18n defaults to (yet internal en)
    req.getLocale().should.equal('en');
    res.getLocale().should.equal('en');

    // as we don't support es i18n defaults to (yet internal en)
    req.__('Hello').should.equal('Hello');
    res.__('Hello').should.equal('Hello');
    i18n.__('Hello').should.equal('Hello');
  });

  it('getLocale should return defaultLocale for req and res with res.setLocale() switching to any unsupported locale', function() {
    i18n.init(req, res);

    // explicitly switch locale on req to unsuperted es
    res.setLocale('es');

    // as we don't support es i18n defaults to (yet internal en)
    i18n.getLocale(req).should.equal('en');
    i18n.getLocale(res).should.equal('en');

    // as we don't support es i18n defaults to (yet internal en)
    req.getLocale().should.equal('en');
    res.getLocale().should.equal('en');

    // as we don't support es i18n defaults to (yet internal en)
    req.__('Hello').should.equal('Hello');
    res.__('Hello').should.equal('Hello');
    i18n.__('Hello').should.equal('Hello');
  });

  it('i18n.setLocale(req) should switch locale for req but not change defaultLocale', function() {
    i18n.init(req, res);

    // switch locale on req
    i18n.setLocale(req, 'de');

    // req get's switched
    i18n.getLocale(req).should.equal('de');
    req.getLocale().should.equal('de');
    req.__('Hello').should.equal('Hallo');

    // res stays default
    i18n.getLocale(res).should.equal('en');
    res.getLocale().should.equal('en');
    res.__('Hello').should.equal('Hello');

    // global stays default
    i18n.getLocale().should.equal('en');
    i18n.__('Hello').should.equal('Hello');
  });

  it('req.setLocale() should switch locale for req but not change defaultLocale', function() {
    i18n.init(req, res);

    // switch locale on req
    req.setLocale('de');

    // req get's switched
    i18n.getLocale(req).should.equal('de');
    req.getLocale().should.equal('de');
    req.__('Hello').should.equal('Hallo');

    // res stays default
    i18n.getLocale(res).should.equal('en');
    res.getLocale().should.equal('en');
    res.__('Hello').should.equal('Hello');

    // global stays default
    i18n.getLocale().should.equal('en');
    i18n.__('Hello').should.equal('Hello');
  });

  it('i18n.setLocale(res) should switch locale for res but not change defaultLocale', function() {
    i18n.init(req, res);

    // switch locale on req
    i18n.setLocale(res, 'de');

    // res get's switched
    i18n.getLocale(res).should.equal('de');
    res.getLocale().should.equal('de');
    res.__('Hello').should.equal('Hallo');

    // req stays default
    i18n.getLocale(req).should.equal('en');
    req.getLocale().should.equal('en');
    req.__('Hello').should.equal('Hello');

    // global stays default
    i18n.getLocale().should.equal('en');
    i18n.__('Hello').should.equal('Hello');
  });

  it('res.setLocale() should switch locale for res but not change defaultLocale', function() {
    i18n.init(req, res);

    // switch locale on req
    res.setLocale('de');

    // res get's switched
    i18n.getLocale(res).should.equal('de');
    res.getLocale().should.equal('de');
    res.__('Hello').should.equal('Hallo');

    // req stays default
    i18n.getLocale(req).should.equal('en');
    req.getLocale().should.equal('en');
    req.__('Hello').should.equal('Hello');

    // global stays default
    i18n.getLocale().should.equal('en');
    i18n.__('Hello').should.equal('Hello');
  });


});