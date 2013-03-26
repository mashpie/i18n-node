/**
 * This example is intended to show a basic plain vanilla setup and
 * also to be run as integration test for concurrency issues.
 *
 * Please remove setTimeout(), if you intend to use it as a blueprint!
 *
 */

// require modules
var http = require('http'),
    i18n = require('../../i18n'),
    url = require('url'),
    app;

// minimal config
i18n.configure({
  locales: ['en', 'de'],
  directory: __dirname + '/locales'
});

// simple server
app = http.createServer(function (req, res) {
  var delay = app.getDelay(req, res);

  // init & guess, see hepler below
  app.i18n(req, res);

  // delay a response to simulate a long running process,
  // while another request comes in with altered language settings
  setTimeout(function () {
    res.end(res.__('Hello'));
  }, delay);

});

// register helper to res and init i18n module for this loop
app.i18n = function (req, res) {
  res.__ = function () {
    return i18n.__.apply(req, arguments);
  };
  i18n.init(req, res);
};

// simple param parsing
app.getDelay = function (req, res) {
  return url.parse(req.url, true).query.delay || 0;
};

// startup
app.listen(3000, '127.0.0.1');
