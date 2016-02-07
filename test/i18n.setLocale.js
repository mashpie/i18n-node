/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

// now with coverage suport
var i18n = require('../i18n'),
  should = require("should"),
  path = require("path");

describe('Locale switching should work on req and res', function() {

  var req;
  var res;

  beforeEach(function() {

    // Force reloading of i18n, to reset configuration
    var i18nPath = 'i18n';
    var i18nFilename = path.resolve(i18nPath + '.js');
    delete require.cache[i18nFilename];
    i18n = require(i18nFilename);

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

});