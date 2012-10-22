/**
 * @author      Created by Marcus Spiegel <marcus.spiegel@gmail.com> on 2011-03-25.
 * @link        https://github.com/mashpie/i18n-node
 * @license          http://creativecommons.org/licenses/by-sa/3.0/
 *
 * @version     0.3.5
 */

// dependencies
var vsprintf = require('sprintf').vsprintf,
  fs = require('fs'),
  url = require('url'),
  path = require('path'),
  locales = {},
  defaultLocale = null,
  updateFiles = true,
  cookiename = null,
  debug = false,
  verbose = false,
  extension = '.js',
  directory = './locales';

function Locale(language, region, q) {
  this.q = (typeof q != 'undefined') ? q : 1;
  this.language = language;
  this.region = region;
}

Locale.prototype.toString = function () {
  return this.language + (this.region ? '_' + this.region : '');
}

Locale.fromString = function (str, q) {
  var match = str.match(/^([a-z]{2})(?:[-_]([A-Z]{2,5}))?$/i); //only ISO-639 for primary-tag
  if (match) {
    return new Locale(match[1].toLowerCase(), (match[2] ? match[2].toUpperCase() : null), q);
  }
  return null;
}

// public exports
var i18n = exports;

i18n.version = '0.3.5';

i18n.Locale = Locale;

i18n.configure = function (opt) {
  // you may register helpers in global scope, up to you
  if (typeof opt.register === 'object') {
    opt.register.__ = i18n.__;
    opt.register.__n = i18n.__n;
    opt.register.getLocale = i18n.getLocale;
  }

  // sets a custom default locale
  if (typeof opt.defaultLocale === 'string') {
    defaultLocale = Locale.fromString(opt.defaultLocale);
  }

  if (!defaultLocale) {
    defaultLocale = Locale.fromString('en_US');
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

  // write new locale information to disk
  if (typeof opt.updateFiles === 'boolean') {
    updateFiles = opt.updateFiles
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
    if (!request.locale) {
      i18n.setLocale(request, defaultLocale);
    }
  }
  if (typeof next === 'function') {
    next();
  }
};

i18n.__ = function () {
  var locale;
  if (this && (this.locale || this.scope)) {
    locale = this.locale || this.scope.locale;
  }
  var msg = translate(locale, arguments[0]);
  if (arguments.length > 1) {
    if (arguments.length == 2 && typeof arguments[1] == 'object') {
      var replacements = arguments[1];
      for (var p in replacements) {
        msg = msg.replace('{' + p + '}', replacements[p]);
      }
    } else {
      msg = vsprintf(msg, Array.prototype.slice.call(arguments, 1));
    }
  }
  return msg;
};

i18n.__n = function () {
  var locale;
  if (this && (this.locale || this.scope)) {
    locale = this.locale || this.scope.locale;
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
i18n.setLocale = function (arg1, arg2, strict) {
  var request = undefined,
    target_locale = arg1;

  if (arg2) {
    request = arg1;
    target_locale = arg2;
  }

  if (typeof target_locale == 'string') {
    target_locale = Locale.fromString(target_locale);
  }
  if (target_locale) {
    var target_locale_key = target_locale.toString();
    if (!strict && !locales[target_locale_key]) { //if full match not found, pick by language only
      for (var p in locales) {
        var l = Locale.fromString(p);
        if (l && target_locale.language == l.language) {
          target_locale = l;
          target_locale_key = target_locale.toString();
        }
      }
    }

    if (locales[target_locale_key]) {
      if (request === undefined) {
        defaultLocale = target_locale;
      }
      else {
        request.locale = target_locale;
      }
    }
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
    i18n.setLocale(req, Locale.fromString(urlObj.query.locale));
  }
};

// ===================
// = private methods =
// ===================
// guess language setting based on http headers

function guessLanguage(request) {
  if (typeof request === 'object') {
    var language_header = request.headers['accept-language'];

    request.locales = [];
    request.locale = null;

    if (language_header) {
      language_header.split(';').forEach(function (block) {
        var q = 1, locales = [];
        var header = block.split(',').forEach(function (piece) {
          var nq = piece.match(/^q=([01]{1}(?:.[0-9]{1,3})?)$/); // rfc2616
          if (nq) {
            q = parseFloat(nq[1]);
            for (var p in locales) { //set q, it was not set yet
              locales[p].q = q;
            }
            return;
          }

          var locale = Locale.fromString(piece, q);
          if (locale) {
            locales.push(locale);
          }
        });

        for (var p in locales) {
          request.locales.push(locales[p]); //dump to request locales
        }
        locales = [];
      });
    }

    request.locales.sort(function (a, b) {
      if (a.q > b.q) return -1;
      if (a.q < b.q) return 1;
      return 0;
    });

    // setting the language by cookie
    if (cookiename && request.cookies[cookiename]) {
      var cookie_value = request.cookies[cookiename];
      for (var p in request.locales) {
        if (request.locales[p] == cookie_value) {
          i18n.setLocale(request, request.locales[p], true);
        }
      }
    }

    if (!request.locale && request.locales) {
      for (var p in request.locales) {
        if (request.locale) break;
        i18n.setLocale(request, request.locales[p], true);
      }
    }
  }
}

/**
 * read locale file, translate a msg and write to fs if new
 *
 * @param string locale
 * @param singular
 * @param plural
 * @return {*}
 */
function translate(locale, singular, plural) {
  if (locale === undefined) {
    if (debug) console.warn("WARN: No locale found - check the context of the call to $__. Using " + defaultLocale + " (set by request) as current locale");
    locale = defaultLocale;
  }

  if (typeof locale == 'string') {
    locale = Locale.fromString(locale);
  }

  var localeKey = locale.toString();

  if (!locales[localeKey]) {
    read(localeKey);
  }

  if (plural) {
    if (!locales[localeKey][singular]) {
      locales[localeKey][singular] = {
        'one':singular,
        'other':plural
      };
      write(localeKey);
    }
  }

  if (!locales[localeKey][singular]) {
    locales[localeKey][singular] = singular;
    write(localeKey);
  }
  return locales[localeKey][singular];
}

/**
 * try read locale file
 *
 * @param string locale
 */
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

/**
 * try writing a file in a created directory
 *
 * @param string locale
 */
function write(locale) {
  // don't write new locale information to disk if updateFiles isn't true
  if (!updateFiles) {
    return;
  }

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

/**
 * basic normalization of filepath
 *
 * @param string locale
 *
 * @return string
 */
function locate(locale) {
  var ext = extension || '.js';
  return path.normalize(directory + '/' + locale + ext);
}
