var express = require('express');
var url = require('url');
var i18n = require('../../i18n');

// another 'global' object that is bound to i18n additionaly
// DANGER! this `funkyObject` is NOT concurrency aware,
// while req, res and res.locals are and will always be
var funkyObject = {};

i18n.configure({
  locales: ['en', 'de', 'ar'],
  register: funkyObject,
  directory: __dirname + '/locales'
});

var app = express();
app.use(i18n.init);

// uses locale as guessed by accept-headers
// req: Hallo res: Hallo res.locals: Hallo funkyObject: Hallo
app.get('/default/:lang', function(req, res) {
  render(req, res);
});

// implicitly sets all
// req: مرحبا res: مرحبا res.locals: مرحبا funkyObject: مرحبا
app.get('/onreq/:lang', function(req, res) {
  i18n.setLocale(req, req.params.lang);
  render(req, res);
});

// sets res, res.locals and funkyObject
// req: Hallo res: مرحبا res.locals: مرحبا funkyObject: مرحبا
app.get('/onres/:lang', function(req, res) {
  i18n.setLocale(res, req.params.lang);
  render(req, res);
});

// sets res.locals and funkyObject
// req: Hallo res: Hallo res.locals: مرحبا funkyObject: مرحبا
app.get('/onreslocals/:lang', function(req, res) {
  i18n.setLocale(res.locals, req.params.lang);
  render(req, res);
});

// sets funkyObject only
// req: Hallo res: Hallo res.locals: Hallo funkyObject: مرحبا
app.get('/onfunky/:lang', function(req, res) {
  i18n.setLocale(funkyObject, req.params.lang);
  render(req, res);
});

// sets req & funkyObject only
// req: مرحبا res: Hallo res.locals: Hallo funkyObject: مرحبا
app.get('/onarray/:lang', function(req, res) {
  i18n.setLocale([req, funkyObject], req.params.lang);
  render(req, res);
});

// sets res & funkyObject only
// req: Hallo res: مرحبا res.locals: Hallo funkyObject: مرحبا
app.get('/onresonly/:lang', function(req, res) {
  i18n.setLocale(res, req.params.lang, true);
  render(req, res);
});

var getBody = function(req, res){
  var body = '';
  body += ' req: ' + req.__('Hello');
  body += ' res: ' + res.__('Hello');
  body += ' res.locals: ' + res.locals.__('Hello');
  body += ' funkyObject: ' + funkyObject.__('Hello');
  return body;
};

var render = function(req, res){
  setTimeout(function () {
    res.send('<body>' + getBody(req, res) + '</body>');
  }, app.getDelay(req, res));
};

// simple param parsing
app.getDelay = function (req, res) {
  return url.parse(req.url, true).query.delay || 0;
};

// startup
app.listen(3000);