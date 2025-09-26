var express = require('express')
var cookieParser = require('cookie-parser')
var url = require('url')
var path = require('path')
var i18n = require('../..') // require('i18n')

i18n.configure({
  locales: ['en', 'de', 'ar'],
  cookie: 'yourcookiename',
  directory: path.join(__dirname, 'locales'),
  updateFiles: false
})

var app = express()
app.use(cookieParser())
app.use(i18n.init)

app.get('/test', function (req, res) {
  // delay a response to simulate a long running process,
  // while another request comes in with altered language settings
  setTimeout(function () {
    res.send(
      '<body>res: ' + res.__('Hello') + ' req: ' + req.__('Hello') + '</body>'
    )
  }, app.getDelay(req, res))
})

app.get('/testfail', function (req, res) {
  // delay a response to simulate a long running process,
  // while another request comes in with altered language settings
  setTimeout(function () {
    res.send('<body>' + i18n.__('Hello') + '</body>')
  }, app.getDelay(req, res))
})

// simple param parsing
app.getDelay = function (req, res) {
  // eslint-disable-next-line node/no-deprecated-api
  return url.parse(req.url, true).query.delay || 0
}

// startup
app.listen(3000)

// export for testing
module.exports = app
