/**
 * @author      Created by Marcus Spiegel <marcus.spiegel@gmail.com> on 2011-03-25.
 * @link        https://github.com/mashpie/i18n-node
 * @license		  http://creativecommons.org/licenses/by-sa/3.0/
 *
 * @version     0.3.5
 */

// dependencies
var vsprintf = require('sprintf').vsprintf,
    fs = require('fs'),
    url = require('url'),
    path = require('path'),
    locales = {},
    defaultLocale = 'en',
    cookiename = null,
    debug = false,
    verbose = false,
    extension = '.js',
    directory = './locales';

// public exports
var i18n = exports;

i18n.version = '0.3.5';

i18n.configure = function (opt) {
  // you may register helpers in global scope, up to you
  if (typeof opt.register === 'object') {
    opt.register.__ = i18n.__;
    opt.register.__n = i18n.__n;
    opt.register.getLocale = i18n.getLocale;
  }

  // sets a custom cookie name to parse locale settings from
  if (typeof opt.cookie === 'string') {
    cookiename = opt.cookie;
  }

  // where to store json files
  if (typeof opt.directory === 'string') {
    directory = opt.directory;
  } else {
    directory = './locales';
  }

  // where to store json files
  if (typeof opt.extension === 'string') {
    extension = opt.extension;
  }

  // enabled some debug output
  if (opt.debug) {
    debug = opt.debug;
  }

  // implicitly read all locales
  if (typeof opt.locales === 'object') {
    opt.locales.forEach(function (l) {
      read(l);
    });
  }
};

i18n.init = function (request, response, next) {
  if (typeof request === 'object') {
    guessLanguage(request);
  }
  if (typeof next === 'function') {
    next();
  }
};

i18n.__ = function () {
  var locale;
  if (this && this.scope) {
    locale = this.scope.locale;
  }
  var msg = translate(locale, arguments[0]);
  if (arguments.length > 1) {
    msg = vsprintf(msg, Array.prototype.slice.call(arguments, 1));
  }
  return msg;
};

i18n.__n = function () {
  var locale;
  if (this && this.scope) {
    locale = this.scope.locale;
  }
  var singular = arguments[0];
  var plural = arguments[1];
  var count = arguments[2];
  var msg = translate(locale, singular, plural);

  if (parseInt(count, 10) > 1) {
    msg = vsprintf(msg.other, [count]);
  } else {
    msg = vsprintf(msg.one, [count]);
  }

  if (arguments.length > 3) {
    msg = vsprintf(msg, Array.prototype.slice.call(arguments, 3));
  }

  return msg;
};

// either gets called like 
// setLocale('en') or like
// setLocale(req, 'en')
i18n.setLocale = function (arg1, arg2) {
  var request = {},
      target_locale = arg1;

  if (arg2 && locales[arg2]) {
    request = arg1;
    target_locale = arg2;
  }

  if (locales[target_locale]) {
    request.locale = target_locale;
    defaultLocale = target_locale;
  }
  return i18n.getLocale(request);
};

i18n.getLocale = function (request) {
  if (request === undefined) {
    return defaultLocale;
  }
  return request.locale;
};

i18n.overrideLocaleFromQuery = function (req) {
  if (req == null) {
    return;
  }
  var urlObj = url.parse(req.url, true);
  if (urlObj.query.locale) {
    if (debug) console.log("Overriding locale from query: " + urlObj.query.locale);
    i18n.setLocale(req, urlObj.query.locale.toLowerCase());
  }
};

// ===================
// = private methods =
// ===================
// guess language setting based on http headers

function guessLanguage(request) {
  if (typeof request === 'object') {
    var language_header = request.headers['accept-language'],
        languages = [],
        regions = [];

    request.languages = [defaultLocale];
    request.regions = [defaultLocale];
    request.language = defaultLocale;
    request.region = defaultLocale;

    if (language_header) {
      language_header.split(',').forEach(function (l) {
        var header = l.split(';', 1)[0];
        var lr = header.split('-', 2);
        if (lr[0]) {
          languages.push(lr[0].toLowerCase());
        }
        if (lr[1]) {
          regions.push(lr[1].toLowerCase());
        }
      });

      if (languages.length > 0) {
        request.languages = languages;
        request.language = languages[0];
      }

      if (regions.length > 0) {
        request.regions = regions;
        request.region = regions[0];
      }
    }

    // setting the language by cookie
    if (cookiename && request.cookies[cookiename]) {
      request.language = request.cookies[cookiename];
    }

    i18n.setLocale(request, request.language);
  }
}

// read locale file, translate a msg and write to fs if new

function translate(locale, singular, plural) {
  if (locale === undefined) {
    if (debug) console.warn("WARN: No locale found - check the context of the call to $__. Using " + defaultLocale + " (set by request) as current locale");
    locale = defaultLocale;
  }

  if (!locales[locale]) {
    read(locale);
  }

  if (plural) {
    if (!locales[locale][singular]) {
      locales[locale][singular] = {
        'one': singular,
        'other': plural
      };
      write(locale);
    }
  }

  if (!locales[locale][singular]) {
    locales[locale][singular] = singular;
    write(locale);
  }
  return locales[locale][singular];
}

// try reading a file

function read(locale) {
  var localeFile = {};
  var file = locate(locale);
  try {
    if (verbose) console.log('read ' + file + ' for locale: ' + locale);
    localeFile = fs.readFileSync(file);
    try {
      // parsing filecontents to locales[locale]
      locales[locale] = JSON.parse(localeFile);
    } catch (e) {
      console.error('unable to parse locales from file (maybe ' + file + ' is empty or invalid json?): ', e);
    }
  } catch (e) {
    // unable to read, so intialize that file
    // locales[locale] are already set in memory, so no extra read required
    // or locales[locale] are empty, which initializes an empty locale.json file
    if (verbose) console.log('initializing ' + file);
    write(locale);
  }
}

// try writing a file in a created directory

function write(locale) {
  // creating directory if necessary 
  try {
    var stats = fs.lstatSync(directory);
  } catch (e) {
    if (debug) console.log('creating locales dir in: ' + directory);
    fs.mkdirSync(directory, 0755);
  }

  // first time init has an empty file
  if (!locales[locale]) {
    locales[locale] = {};
  }

  // writing to tmp and rename on success
  try {
    var target = locate(locale),
        tmp = target + ".tmp";

    fs.writeFileSync(tmp, JSON.stringify(locales[locale], null, "\t"), "utf8");
    var Stats = fs.statSync(tmp);
    if (Stats.isFile()) {
      fs.renameSync(tmp, target);
    } else {
      console.error('unable to write locales to file (either ' + tmp + ' or ' + target + ' are not writeable?): ', e);
    }
  } catch (e) {
    console.error('unexpected error writing files (either ' + tmp + ' or ' + target + ' are not writeable?): ', e);
  }

}

// basic normalization of filepath

function locate(locale) {
  var ext = extension || '.js';
  return path.normalize(directory + '/' + locale + ext);
}
