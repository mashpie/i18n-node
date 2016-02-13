require('./index');

var Browser = require('zombie'),
  visitLinks = require('../testlib/visitlinks'),
  DE = new Browser({
    headers: {
      'accept-language': 'de'
    }
  });

describe('Using i18n in express 4.x with setLocale', function() {

  describe('res.send() is able to handle concurrent request correctly', function() {
    var expected = 'req: Hallo res: Hallo res.locals: Hallo funkyObject: Hallo';
    var url = 'default';
    describe('serial requests', function() {
      visitLinks('series', url + '/ar', DE, expected, DE, expected);
    });
    describe('parallel requests', function() {
      visitLinks('parallel', url + '/ar', DE, expected, DE, expected);
    });
  });

  describe('i18n.setLocale(req, req.params.lang) is able to set locales correctly by param', function() {
    var expected = 'req: مرحبا res: مرحبا res.locals: مرحبا funkyObject: مرحبا';
    var url = 'onreq';
    describe('serial requests', function() {
      visitLinks('series', url + '/ar', DE, expected, DE, expected);
    });
    describe('parallel requests', function() {
      visitLinks('parallel', url + '/ar', DE, expected, DE, expected);
    });
  });

  describe('i18n.setLocale(res, req.params.lang) is able to set locales correctly by param', function() {
    var expected = 'req: Hallo res: مرحبا res.locals: مرحبا funkyObject: مرحبا';
    var url = 'onres';
    describe('serial requests', function() {
      visitLinks('series', url + '/ar', DE, expected, DE, expected);
    });
    describe('parallel requests', function() {
      visitLinks('parallel', url + '/ar', DE, expected, DE, expected);
    });
  });

  describe('i18n.setLocale(res.locals, req.params.lang) is able to set locales correctly by param', function() {
    var expected = 'req: Hallo res: Hallo res.locals: مرحبا funkyObject: مرحبا';
    var url = 'onreslocals';
    describe('serial requests', function() {
      visitLinks('series', url + '/ar', DE, expected, DE, expected);
    });
    describe('parallel requests', function() {
      visitLinks('parallel', url + '/ar', DE, expected, DE, expected);
    });
  });

  describe('i18n.setLocale(res.locals, req.params.lang) is able to set locales correctly by param', function() {
    var expected = 'req: Hallo res: Hallo res.locals: Hallo funkyObject: مرحبا';
    var url = 'onfunky';
    describe('serial requests', function() {
      visitLinks('series', url + '/ar', DE, expected, DE, expected);
    });
    describe('parallel requests', function() {
      visitLinks('parallel', url + '/ar', DE, expected, DE, expected);
    });
  });

  describe('i18n.setLocale(res.locals, req.params.lang) is able to set locales correctly by param', function() {
    var expected = 'req: مرحبا res: Hallo res.locals: Hallo funkyObject: مرحبا';
    var url = 'onarray';
    describe('serial requests', function() {
      visitLinks('series', url + '/ar', DE, expected, DE, expected);
    });
    describe('parallel requests', function() {
      visitLinks('parallel', url + '/ar', DE, expected, DE, expected);
    });
  });

  describe('i18n.setLocale(res.locals, req.params.lang) is able to set locales correctly by param', function() {
    var expected = 'req: Hallo res: مرحبا res.locals: Hallo funkyObject: مرحبا';
    var url = 'onresonly';
    describe('serial requests', function() {
      visitLinks('series', url + '/ar', DE, expected, DE, expected);
    });
    describe('parallel requests', function() {
      visitLinks('parallel', url + '/ar', DE, expected, DE, expected);
    });
  });

});