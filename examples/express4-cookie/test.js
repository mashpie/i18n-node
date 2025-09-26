/**
 * run like so:
 * $ mocha --exit test.js
 */

var app = require('./index')
var request = require('supertest')
var visitLinks = require('../testlib/visitlinks')

var DE = request(app)
var EN = request(app)
var AR = request(app)

describe('Using i18n in express 4.x with cookieParser', function () {
  describe('res.__() is able to handle concurrent request correctly', function () {
    describe('serial requests', function () {
      visitLinks(
        'series',
        'test',
        EN,
        '<body>res: Hello req: Hello</body>',
        DE,
        '<body>res: Hallo req: Hallo</body>',
        { enCookies: 'yourcookiename=en', deCookies: 'yourcookiename=de' }
      )
    })

    describe('parallel requests', function () {
      visitLinks(
        'parallel',
        'test',
        EN,
        '<body>res: Hello req: Hello</body>',
        DE,
        '<body>res: Hallo req: Hallo</body>',
        { enCookies: 'yourcookiename=en', deCookies: 'yourcookiename=de' }
      )
    })

    describe('serial requests AR', function () {
      visitLinks(
        'series',
        'test',
        EN,
        '<body>res: Hello req: Hello</body>',
        AR,
        '<body>res: مرحبا req: مرحبا</body>',
        { enCookies: 'yourcookiename=en', deCookies: 'yourcookiename=ar' }
      )
    })

    describe('parallel requests AR', function () {
      visitLinks(
        'parallel',
        'test',
        EN,
        '<body>res: Hello req: Hello</body>',
        AR,
        '<body>res: مرحبا req: مرحبا</body>',
        { enCookies: 'yourcookiename=en', deCookies: 'yourcookiename=ar' }
      )
    })
  })

  describe('i18n.__() is NOT able to handle concurrent request correctly', function () {
    describe('serial requests', function () {
      visitLinks(
        'series',
        'testfail',
        EN,
        '<body>Hello</body>',
        DE,
        '<body>Hello</body>',
        {
          enCookies: 'yourcookiename=en',
          deCookies: 'yourcookiename=de'
        }
      )
    })

    describe('parallel requests', function () {
      visitLinks(
        'parallel',
        'testfail',
        EN,
        '<body>Hello</body>',
        DE,
        '<body>Hello</body>',
        {
          enCookies: 'yourcookiename=en',
          deCookies: 'yourcookiename=de'
        }
      )
    })
  })
})
