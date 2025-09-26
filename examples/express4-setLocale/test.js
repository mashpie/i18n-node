var app = require('./index')
var request = require('supertest')
var visitLinks = require('../testlib/visitlinks')

var DE = request(app)

describe('Using i18n in express 4.x with setLocale', function () {
  describe('res.send() is able to handle concurrent request correctly', function () {
    var expected =
      '<body> req: Hallo res: Hallo res.locals: Hallo funkyObject: Hallo</body>'
    var url = 'default'
    describe('serial requests', function () {
      visitLinks('series', url + '/ar', DE, expected, DE, expected, {
        deHeaders: { 'accept-language': 'de' },
        enHeaders: { 'accept-language': 'de' }
      })
    })
    describe('parallel requests', function () {
      visitLinks('parallel', url + '/ar', DE, expected, DE, expected, {
        deHeaders: { 'accept-language': 'de' },
        enHeaders: { 'accept-language': 'de' }
      })
    })
  })

  describe('i18n.setLocale(req, req.params.lang) is able to set locales correctly by param', function () {
    var expected =
      '<body> req: مرحبا res: مرحبا res.locals: مرحبا funkyObject: مرحبا</body>'
    var url = 'onreq'
    describe('serial requests', function () {
      visitLinks('series', url + '/ar', DE, expected, DE, expected)
    })
    describe('parallel requests', function () {
      visitLinks('parallel', url + '/ar', DE, expected, DE, expected)
    })
  })

  describe('i18n.setLocale(res, req.params.lang) is able to set locales correctly by param', function () {
    var expected =
      '<body> req: Hallo res: مرحبا res.locals: مرحبا funkyObject: مرحبا</body>'
    var url = 'onres'
    describe('serial requests', function () {
      visitLinks('series', url + '/ar', DE, expected, DE, expected)
    })
    describe('parallel requests', function () {
      visitLinks('parallel', url + '/ar', DE, expected, DE, expected)
    })
  })

  describe('i18n.setLocale(res.locals, req.params.lang) is able to set locales correctly by param', function () {
    var expected =
      '<body> req: Hallo res: Hallo res.locals: مرحبا funkyObject: مرحبا</body>'
    var url = 'onreslocals'
    describe('serial requests', function () {
      visitLinks('series', url + '/ar', DE, expected, DE, expected)
    })
    describe('parallel requests', function () {
      visitLinks('parallel', url + '/ar', DE, expected, DE, expected)
    })
  })

  describe('i18n.setLocale(res.locals, req.params.lang) is able to set locales correctly by param', function () {
    var expected =
      '<body> req: Hallo res: Hallo res.locals: Hallo funkyObject: مرحبا</body>'
    var url = 'onfunky'
    describe('serial requests', function () {
      visitLinks('series', url + '/ar', DE, expected, DE, expected)
    })
    describe('parallel requests', function () {
      visitLinks('parallel', url + '/ar', DE, expected, DE, expected)
    })
  })

  describe('i18n.setLocale(res.locals, req.params.lang) is able to set locales correctly by param', function () {
    var expected =
      '<body> req: مرحبا res: Hallo res.locals: Hallo funkyObject: مرحبا</body>'
    var url = 'onarray'
    describe('serial requests', function () {
      visitLinks('series', url + '/ar', DE, expected, DE, expected)
    })
    describe('parallel requests', function () {
      visitLinks('parallel', url + '/ar', DE, expected, DE, expected)
    })
  })

  describe('i18n.setLocale(res.locals, req.params.lang) is able to set locales correctly by param', function () {
    var expected =
      '<body> req: Hallo res: مرحبا res.locals: Hallo funkyObject: مرحبا</body>'
    var url = 'onresonly'
    describe('serial requests', function () {
      visitLinks('series', url + '/ar', DE, expected, DE, expected)
    })
    describe('parallel requests', function () {
      visitLinks('parallel', url + '/ar', DE, expected, DE, expected)
    })
  })
})
