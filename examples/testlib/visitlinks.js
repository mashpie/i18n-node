var async = require('async')
var request = require('supertest')
require('should')

module.exports = visitLinks

function visitLinks(
  asyncMethod,
  url,
  requestEN,
  textEN,
  requestDE,
  textDE,
  options = {}
) {
  return it(
    'should show ' +
      textEN +
      ' in first request and ' +
      textDE +
      ' in second request',
    function (done) {
      return async[asyncMethod](
        [
          function (cb) {
            var req = requestEN.get('/' + url + '/?delay=1000')

            if (options.enHeaders) {
              Object.keys(options.enHeaders).forEach((key) => {
                req = req.set(key, options.enHeaders[key])
              })
            }
            if (options.enCookies) {
              req = req.set('Cookie', options.enCookies)
            }
            if (!options.enHeaders && !options.enCookies) {
              req = req.set('accept-language', 'en')
            }

            return req.expect(200).end(function (err, res) {
              if (err) return cb(err)
              res.text.should.equal(textEN)
              return cb()
            })
          },

          function (cb) {
            return setTimeout(function () {
              var req = requestDE.get('/' + url + '/')

              if (options.deHeaders) {
                Object.keys(options.deHeaders).forEach((key) => {
                  req = req.set(key, options.deHeaders[key])
                })
              }
              if (options.deCookies) {
                req = req.set('Cookie', options.deCookies)
              }
              if (!options.deHeaders && !options.deCookies) {
                req = req.set('accept-language', 'de')
              }

              return req.expect(200).end(function (err, res) {
                if (err) return cb(err)
                res.text.should.equal(textDE)
                return cb()
              })
            }, 200)
          }
        ],
        done
      )
    }
  )
}
