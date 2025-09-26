/**
 * This example is intended to show a basic plain vanilla setup and
 * also to be run as integration test for concurrency issues.
 *
 * Please remove setTimeout(), if you intend to use it as a blueprint!
 *
 */

// require modules
var http = require('http')
var i18n = require('../..') // require('i18n')
var url = require('url')
var path = require('path')
var app

// minimal config
i18n.configure({
  locales: ['en', 'de'],
  directory: path.join(__dirname, 'locales'),
  updateFiles: false,
  autoReload: true
})

// simple server
app = http.createServer(function (req, res) {
  var delay = app.getDelay(req, res)

  // init & guess
  i18n.init(req, res)

  // delay a response to simulate a long running process,
  // while another request comes in with altered language settings
  setTimeout(function () {
    res.end(res.__('Hello'))
  }, delay)
})

// simple param parsing
app.getDelay = function (req, res) {
  // eslint-disable-next-line node/no-deprecated-api
  return url.parse(req.url, true).query.delay || 0
}

// startup
app.listen(3000, '127.0.0.1')

// export for testing
module.exports = app
