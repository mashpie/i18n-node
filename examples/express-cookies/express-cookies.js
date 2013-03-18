var express = require('express'),
    i18n = require('../../i18n'),
    app = module.exports = express();

i18n.configure({
  locales: ['en', 'de'],
  cookie: 'yourcookiename',
  directory: __dirname+'/locales',
});

// app.initI18n = function (req, res) {
//   res.__ = function () {
//     return i18n.__.apply(req, arguments);
//   };
//   i18n.init(req, res);
// };

app.configure(function () {
  app.use(express.cookieParser());
  app.use(i18n.init);
  app.use(function (req, res, next) {
    res.locals.__ = res.__ = function () {
      return i18n.__.apply(req, arguments);
    };
    res.locals.__n = res.__n = function () {
      return i18n.__n.apply(req, arguments);
    };
    next();
  });
  return app.use(app.router);
});

app.get('/test', function (req, res) {
  var _ref = 0,
      delay = (_ref = req.query.delay) != null ? _ref : 0;
  return setTimeout(function () {
    res.send('<body>' + res.__('Hello') + '</body>');
  }, delay);
});

app.get('/testfail', function (req, res) {
  var _ref = 0,
      delay = (_ref = req.query.delay) != null ? _ref : 0;
  return setTimeout(function () {
    res.send('<body>' + i18n.__('Hello') + '</body>');
  }, delay);
});

app.listen(3000);
