/**
 * @author      Created by Marcus Spiegel <marcus.spiegel@gmail.com> on 2011-03-25.
 * @link        https://github.com/mashpie/i18n-node
 * @license     http://opensource.org/licenses/MIT
 *
 * @version     0.8.1
 */

'use strict';

// dependencies
var vsprintf = require('sprintf-js').vsprintf,
  fs = require('fs'),
  url = require('url'),
  path = require('path'),
  debug = require('debug')('i18n:debug'),
  warn = require('debug')('i18n:warn'),
  error = require('debug')('i18n:error'),
  Mustache = require('mustache'),
  Messageformat = require('messageformat'),
  MakePlural = require('make-plural/make-plural').load(
    require('make-plural/data/plurals.json')
  ),
  parseInterval = require('math-interval-parser').default;

// exports an instance
module.exports = (function() {

  var MessageformatInstanceForLocale = {},
    PluralsForLocale = {},
    locales = {},
    api = {
      '__': '__',
      '__n': '__n',
      '__l': '__l',
      '__h': '__h',
      '__mf': '__mf',
      'getLocale': 'getLocale',
      'setLocale': 'setLocale',
      'getCatalog': 'getCatalog',
      'getLocales': 'getLocales',
      'addLocale': 'addLocale',
      'removeLocale': 'removeLocale'
    },
    pathsep = path.sep, // ---> means win support will be available in node 0.8.x and above
    autoReload,
    cookiename,
    defaultLocale,
    directory,
    directoryPermissions,
    extension,
    fallbacks,
    indent,
    logDebugFn,
    logErrorFn,
    logWarnFn,
    objectNotation,
    prefix,
    queryParameter,
    register,
    updateFiles,
    syncFiles;

  // public exports
  var i18n = {};

  i18n.locales = locales;

  i18n.version = '0.8.1';

  i18n.configure = function i18nConfigure(opt) {

    // reset locales
    locales = {};

    // Provide custom API method aliases if desired
    // This needs to be processed before the first call to applyAPItoObject()
    if (opt.api && typeof opt.api === 'object') {
      for (var method in opt.api) {
        if (opt.api.hasOwnProperty(method)) {
          var alias = opt.api[method];
          if (typeof api[method] !== 'undefined') {
            api[method] = alias;
          }
        }
      }
    }

    // you may register i18n in global scope, up to you
    if (typeof opt.register === 'object') {
      register = opt.register;
      // or give an array objects to register to
      if (Array.isArray(opt.register)) {
        register = opt.register;
        register.forEach(function(r) {
          applyAPItoObject(r);
        });
      } else {
        applyAPItoObject(opt.register);
      }
    }

    // sets a custom cookie name to parse locale settings from
    cookiename = (typeof opt.cookie === 'string') ? opt.cookie : null;

    // query-string parameter to be watched - @todo: add test & doc
    queryParameter = (typeof opt.queryParameter === 'string') ? opt.queryParameter : null;

    // where to store json files
    directory = (typeof opt.directory === 'string') ?
      opt.directory : path.join(__dirname, 'locales');

    // permissions when creating new directories
    directoryPermissions = (typeof opt.directoryPermissions === 'string') ?
      parseInt(opt.directoryPermissions, 8) : null;

    // write new locale information to disk
    updateFiles = (typeof opt.updateFiles === 'boolean') ? opt.updateFiles : true;

    // sync locale information accros all files
    syncFiles = (typeof opt.syncFiles === 'boolean') ? opt.syncFiles : false;

    // what to use as the indentation unit (ex: "\t", "  ")
    indent = (typeof opt.indent === 'string') ? opt.indent : '\t';

    // json files prefix
    prefix = (typeof opt.prefix === 'string') ? opt.prefix : '';

    // where to store json files
    extension = (typeof opt.extension === 'string') ? opt.extension : '.json';

    // setting defaultLocale
    defaultLocale = (typeof opt.defaultLocale === 'string') ? opt.defaultLocale : 'en';

    // auto reload locale files when changed
    autoReload = (typeof opt.autoReload === 'boolean') ? opt.autoReload : false;

    // enable object notation?
    objectNotation = (typeof opt.objectNotation !== 'undefined') ? opt.objectNotation : false;
    if (objectNotation === true) objectNotation = '.';

    // read language fallback map
    fallbacks = (typeof opt.fallbacks === 'object') ? opt.fallbacks : {};

    // setting custom logger functions
    logDebugFn = (typeof opt.logDebugFn === 'function') ? opt.logDebugFn : debug;
    logWarnFn = (typeof opt.logWarnFn === 'function') ? opt.logWarnFn : warn;
    logErrorFn = (typeof opt.logErrorFn === 'function') ? opt.logErrorFn : error;

    // when missing locales we try to guess that from directory
    opt.locales = opt.locales || guessLocales(directory);

    // implicitly read all locales
    if (Array.isArray(opt.locales)) {

      opt.locales.forEach(function(l) {
        read(l);
      });

      // auto reload locale files when changed
      if (autoReload) {

        // watch changes of locale files (it's called twice because fs.watch is still unstable)
        fs.watch(directory, function(event, filename) {
          var localeFromFile = guessLocaleFromFile(filename);

          if (localeFromFile && opt.locales.indexOf(localeFromFile) > -1) {
            logDebug('Auto reloading locale file "' + filename + '".');
            read(localeFromFile);
          }

        });
      }
    }
  };

  i18n.init = function i18nInit(request, response, next) {
    if (typeof request === 'object') {

      // guess requested language/locale
      guessLanguage(request);

      // bind api to req
      applyAPItoObject(request);

      // looks double but will ensure schema on api refactor
      i18n.setLocale(request, request.locale);
    } else {
      return logError('i18n.init must be called with one parameter minimum, ie. i18n.init(req)');
    }

    if (typeof response === 'object') {
      applyAPItoObject(response);

      // and set that locale to response too
      i18n.setLocale(response, request.locale);
    }

    // head over to next callback when bound as middleware
    if (typeof next === 'function') {
      return next();
    }
  };

  i18n.__ = function i18nTranslate(phrase) {
    var msg;
    var argv = parseArgv(arguments);
    var namedValues = argv[0];
    var args = argv[1];

    // called like __({phrase: "Hello", locale: "en"})
    if (typeof phrase === 'object') {
      if (typeof phrase.locale === 'string' && typeof phrase.phrase === 'string') {
        msg = translate(phrase.locale, phrase.phrase);
      }
    }
    // called like __("Hello")
    else {
      // get translated message with locale from scope (deprecated) or object
      msg = translate(getLocaleFromObject(this), phrase);
    }

    // postprocess to get compatible to plurals
    if (typeof msg === 'object' && msg.one) {
      msg = msg.one;
    }

    // in case there is no 'one' but an 'other' rule
    if (typeof msg === 'object' && msg.other) {
      msg = msg.other;
    }

    // head over to postProcessing
    return postProcess(msg, namedValues, args);
  };

  i18n.__mf = function i18nMessageformat(phrase) {
    var msg, mf, f;
    var targetLocale = defaultLocale;
    var argv = parseArgv(arguments);
    var namedValues = argv[0];
    var args = argv[1];

    // called like __({phrase: "Hello", locale: "en"})
    if (typeof phrase === 'object') {
      if (typeof phrase.locale === 'string' && typeof phrase.phrase === 'string') {
        msg = phrase.phrase;
        targetLocale = phrase.locale;
      }
    }
    // called like __("Hello")
    else {
      // get translated message with locale from scope (deprecated) or object
      msg = phrase;
      targetLocale = getLocaleFromObject(this);
    }

    msg = translate(targetLocale, msg);
    // --- end get msg

    // now head over to Messageformat
    // and try to cache instance
    if (MessageformatInstanceForLocale[targetLocale]) {
      mf = MessageformatInstanceForLocale[targetLocale];
    } else {
      mf = new Messageformat(targetLocale);
      mf.compiledFunctions = {};
      MessageformatInstanceForLocale[targetLocale] = mf;
    }

    // let's try to cache that function
    if (mf.compiledFunctions[msg]) {
      f = mf.compiledFunctions[msg];
    } else {
      f = mf.compile(msg);
      mf.compiledFunctions[msg] = f;
    }

    return postProcess(f(namedValues), namedValues, args);
  };

  i18n.__l = function i18nTranslationList(phrase) {
    var translations = [];
    Object.keys(locales).sort().forEach(function(l) {
      translations.push(i18n.__({ phrase: phrase, locale: l }));
    });
    return translations;
  };

  i18n.__h = function i18nTranslationHash(phrase) {
    var translations = [];
    Object.keys(locales).sort().forEach(function(l) {
      var hash = {};
      hash[l] = i18n.__({ phrase: phrase, locale: l });
      translations.push(hash);
    });
    return translations;
  };

  i18n.__n = function i18nTranslatePlural(singular, plural, count) {
    var msg, namedValues, targetLocale, args = [];

    // Accept an object with named values as the last parameter
    if (argsEndWithNamedObject(arguments)) {
      namedValues = arguments[arguments.length - 1];
      args = arguments.length >= 5 ? Array.prototype.slice.call(arguments, 3, -1) : [];
    } else {
      namedValues = {};
      args = arguments.length >= 4 ? Array.prototype.slice.call(arguments, 3) : [];
    }

    // called like __n({singular: "%s cat", plural: "%s cats", locale: "en"}, 3)
    if (typeof singular === 'object') {
      if (
        typeof singular.locale === 'string' &&
        typeof singular.singular === 'string' &&
        typeof singular.plural === 'string'
      ) {
        targetLocale = singular.locale;
        msg = translate(singular.locale, singular.singular, singular.plural);
      }
      args.unshift(count);

      // some template engines pass all values as strings -> so we try to convert them to numbers
      if (typeof plural === 'number' || parseInt(plural, 10) + '' === plural) {
        count = plural;
      }

      // called like __n({singular: "%s cat", plural: "%s cats", locale: "en", count: 3})
      if (typeof singular.count === 'number' || typeof singular.count === 'string') {
        count = singular.count;
        args.unshift(plural);
      }
    } else {
      // called like  __n('cat', 3)
      if (typeof plural === 'number' || parseInt(plural, 10) + '' === plural) {
        count = plural;

        // we add same string as default
        // which efectivly copies the key to the plural.value
        // this is for initialization of new empty translations
        plural = singular;

        args.unshift(count);
        args.unshift(plural);
      }
      // called like __n('%s cat', '%s cats', 3)
      // get translated message with locale from scope (deprecated) or object
      msg = translate(getLocaleFromObject(this), singular, plural);
      targetLocale = getLocaleFromObject(this);
    }

    if (count === null) count = namedValues.count;

    // enforce number
    count = parseInt(count, 10);

    // find the correct plural rule for given locale
    if (typeof msg === 'object') {
      var p;
      // create a new Plural for locale
      // and try to cache instance
      if (PluralsForLocale[targetLocale]) {
        p = PluralsForLocale[targetLocale];
      } else {
        p = new MakePlural(targetLocale);
        PluralsForLocale[targetLocale] = p;
      }

      // fallback to 'other' on case of missing translations
      msg = msg[p(count)] || msg.other;
    }

    // test for parsable interval string
    if ((/\|/).test(msg)) {
      msg = parsePluralInterval(msg, count);
    }

    // replace the counter
    // parses translation and replaces all digets '%d' by `count`
    // this also replaces extra strings '%%s' to parseble '%s' for last step
    msg = vsprintf(msg, [parseInt(count, 10)]);

    // if the msg string contains {{Mustache}} patterns we render it as a mini tempalate
    if ((/{{.*}}/).test(msg)) {
      msg = Mustache.render(msg, namedValues);
    }

    // if we have extra arguments with strings to get replaced,
    // an additional substition injects those strings afterwards
    if ((/%/).test(msg) && args && args.length > 0) {
      msg = vsprintf(msg, args);
    }

    return msg;
  };

  i18n.setLocale = function i18nSetLocale(object, locale, skipImplicitObjects) {

    // when given an array of objects => setLocale on each
    if (Array.isArray(object) && typeof locale === 'string') {
      for (var i = object.length - 1; i >= 0; i--) {
        i18n.setLocale(object[i], locale, true);
      }
      return i18n.getLocale(object[0]);
    }

    // defaults to called like i18n.setLocale(req, 'en')
    var targetObject = object;
    var targetLocale = locale;

    // called like req.setLocale('en') or i18n.setLocale('en')
    if (locale === undefined && typeof object === 'string') {
      targetObject = this;
      targetLocale = object;
    }

    // consider a fallback
    if (!locales[targetLocale] && fallbacks[targetLocale]) {
      targetLocale = fallbacks[targetLocale];
    }

    // now set locale on object
    targetObject.locale = locales[targetLocale] ? targetLocale : defaultLocale;

    // consider any extra registered objects
    if (typeof register === 'object') {
      if (Array.isArray(register) && !skipImplicitObjects) {
        register.forEach(function(r) {
          r.locale = targetObject.locale;
        });
      } else {
        register.locale = targetObject.locale;
      }
    }

    // consider res
    if (targetObject.res && !skipImplicitObjects) {

      // escape recursion
      // @see  - https://github.com/balderdashy/sails/pull/3631
      //       - https://github.com/mashpie/i18n-node/pull/218
      if (targetObject.res.locals) {
        i18n.setLocale(targetObject.res, targetObject.locale, true);
        i18n.setLocale(targetObject.res.locals, targetObject.locale, true);
      } else {
        i18n.setLocale(targetObject.res, targetObject.locale);
      }
    }

    // consider locals
    if (targetObject.locals && !skipImplicitObjects) {

      // escape recursion
      // @see  - https://github.com/balderdashy/sails/pull/3631
      //       - https://github.com/mashpie/i18n-node/pull/218
      if (targetObject.locals.res) {
        i18n.setLocale(targetObject.locals, targetObject.locale, true);
        i18n.setLocale(targetObject.locals.res, targetObject.locale, true);
      } else {
        i18n.setLocale(targetObject.locals, targetObject.locale);
      }
    }

    return i18n.getLocale(targetObject);
  };

  i18n.getLocale = function i18nGetLocale(request) {

    // called like i18n.getLocale(req)
    if (request && request.locale) {
      return request.locale;
    }

    // called like req.getLocale()
    return this.locale || defaultLocale;
  };

  i18n.getCatalog = function i18nGetCatalog(object, locale) {
    var targetLocale;

    // called like i18n.getCatalog(req)
    if (typeof object === 'object' && typeof object.locale === 'string' && locale === undefined) {
      targetLocale = object.locale;
    }

    // called like i18n.getCatalog(req, 'en')
    if (!targetLocale && typeof object === 'object' && typeof locale === 'string') {
      targetLocale = locale;
    }

    // called like req.getCatalog('en')
    if (!targetLocale && locale === undefined && typeof object === 'string') {
      targetLocale = object;
    }

    // called like req.getCatalog()
    if (!targetLocale &&
      object === undefined &&
      locale === undefined &&
      typeof this.locale === 'string'
    ) {
      if (register && register.GLOBAL) {
        targetLocale = '';
      } else {
        targetLocale = this.locale;
      }
    }

    // called like i18n.getCatalog()
    if (targetLocale === undefined || targetLocale === '') {
      return locales;
    }

    if (!locales[targetLocale] && fallbacks[targetLocale]) {
      targetLocale = fallbacks[targetLocale];
    }

    if (locales[targetLocale]) {
      return locales[targetLocale];
    } else {
      logWarn('No catalog found for "' + targetLocale + '"');
      return false;
    }
  };

  i18n.getLocales = function i18nGetLocales() {
    return Object.keys(locales);
  };

  i18n.addLocale = function i18nAddLocale(locale) {
    read(locale);
  };

  i18n.removeLocale = function i18nRemoveLocale(locale) {
    delete locales[locale];
  };

  // ===================
  // = private methods =
  // ===================

  var postProcess = function(msg, namedValues, args, counter) {
    var count = counter || false;

    // test for parsable interval string
    if ((/\|/).test(msg)) {
      msg = parsePluralInterval(msg, count);
    }

    // replace the counter
    if (count) {
      msg = vsprintf(msg, [parseInt(count, 10)]);
    }

    // if the msg string contains {{Mustache}} patterns we render it as a mini tempalate
    if ((/{{.*}}/).test(msg)) {
      msg = Mustache.render(msg, namedValues);
    }

    // if we have extra arguments with values to get replaced,
    // an additional substition injects those strings afterwards
    if ((/%/).test(msg) && args && args.length > 0) {
      msg = vsprintf(msg, args);
    }

    return msg;
  };

  var argsEndWithNamedObject = function(args) {
    return (args.length > 1 &&
      args[args.length - 1] !== null &&
      typeof args[args.length - 1] === 'object');
  };

  var parseArgv = function(args) {
    var namedValues, returnArgs;

    if (argsEndWithNamedObject(args)) {
      namedValues = args[args.length - 1];
      returnArgs = Array.prototype.slice.call(args, 1, -1);
    } else {
      namedValues = {};
      returnArgs = args.length >= 2 ? Array.prototype.slice.call(args, 1) : [];
    }

    return [namedValues, returnArgs];
  };

  /**
   * registers all public API methods to a given response object when not already declared
   */
  var applyAPItoObject = function(object) {

    var alreadySetted = true;

    // attach to itself if not provided
    for (var method in api) {
      if (api.hasOwnProperty(method)) {
        var alias = api[method];

        // be kind rewind, or better not touch anything already existing
        if (!object[alias]) {
          alreadySetted = false;
          object[alias] = i18n[method].bind(object);
        }
      }
    }

    // set initial locale if not set
    if (!object.locale) {
      object.locale = defaultLocale;
    }

    // escape recursion
    if (alreadySetted) {
      return;
    }

    // attach to response if present (ie. in express)
    if (object.res) {
      applyAPItoObject(object.res);
    }

    // attach to locals if present (ie. in express)
    if (object.locals) {
      applyAPItoObject(object.locals);
    }
  };

  /**
   * tries to guess locales by scanning the given directory
   */
  var guessLocales = function(directory) {
    var entries = fs.readdirSync(directory);
    var localesFound = [];

    for (var i = entries.length - 1; i >= 0; i--) {
      if (entries[i].match(/^\./)) continue;
      var localeFromFile = guessLocaleFromFile(entries[i]);
      if (localeFromFile) localesFound.push(localeFromFile);
    }

    return localesFound.sort();
  };

  /**
   * tries to guess locales from a given filename
   */
  var guessLocaleFromFile = function(filename) {
    var extensionRegex = new RegExp(extension + '$', 'g');
    var prefixRegex = new RegExp('^' + prefix, 'g');

    if (prefix && !filename.match(prefixRegex)) return false;
    if (extension && !filename.match(extensionRegex)) return false;
    return filename.replace(prefix, '').replace(extensionRegex, '');
  };

  /**
   * guess language setting based on http headers
   */

  var guessLanguage = function(request) {
    if (typeof request === 'object') {
      var languageHeader = request.headers['accept-language'],
        languages = [],
        regions = [];

      request.languages = [defaultLocale];
      request.regions = [defaultLocale];
      request.language = defaultLocale;
      request.region = defaultLocale;

      // a query parameter overwrites all
      if (queryParameter && request.url) {
        var urlObj = url.parse(request.url, true);
        if (urlObj.query[queryParameter]) {
          logDebug('Overriding locale from query: ' + urlObj.query[queryParameter]);
          request.language = urlObj.query[queryParameter].toLowerCase();
          return i18n.setLocale(request, request.language);
        }
      }

      // a cookie overwrites headers
      if (cookiename && request.cookies && request.cookies[cookiename]) {
        request.language = request.cookies[cookiename];
        return i18n.setLocale(request, request.language);
      }

      // 'accept-language' is the most common source
      if (languageHeader) {
        var acceptedLanguages = getAcceptedLanguagesFromHeader(languageHeader),
          match, fallbackMatch, fallback;
        for (var i = 0; i < acceptedLanguages.length; i++) {
          var lang = acceptedLanguages[i],
            lr = lang.split('-', 2),
            parentLang = lr[0],
            region = lr[1];

          // Check if we have a configured fallback set for this language.
          if (fallbacks && fallbacks[lang]) {
            fallback = fallbacks[lang];
            // Fallbacks for languages should be inserted
            // where the original, unsupported language existed.
            var acceptedLanguageIndex = acceptedLanguages.indexOf(lang);
            if (acceptedLanguages.indexOf(fallback) < 0) {
              acceptedLanguages.splice(acceptedLanguageIndex + 1, 0, fallback);
            }
          }

          // Check if we have a configured fallback set for the parent language of the locale.
          if (fallbacks && fallbacks[parentLang]) {
            fallback = fallbacks[parentLang];
            // Fallbacks for a parent language should be inserted
            // to the end of the list, so they're only picked
            // if there is no better match.
            if (acceptedLanguages.indexOf(fallback) < 0) {
              acceptedLanguages.push(fallback);
            }
          }

          if (languages.indexOf(parentLang) < 0) {
            languages.push(parentLang.toLowerCase());
          }
          if (region) {
            regions.push(region.toLowerCase());
          }

          if (!match && locales[lang]) {
            match = lang;
            break;
          }

          if (!fallbackMatch && locales[parentLang]) {
            fallbackMatch = parentLang;
          }
        }

        request.language = match || fallbackMatch || request.language;
        request.region = regions[0] || request.region;
        return i18n.setLocale(request, request.language);
      }
    }

    // last resort: defaultLocale
    return i18n.setLocale(request, defaultLocale);
  };

  /**
   * Get a sorted list of accepted languages from the HTTP Accept-Language header
   */
  var getAcceptedLanguagesFromHeader = function(header) {
    var languages = header.split(','),
      preferences = {};
    return languages.map(function parseLanguagePreference(item) {
      var preferenceParts = item.trim().split(';q=');
      if (preferenceParts.length < 2) {
        preferenceParts[1] = 1.0;
      } else {
        var quality = parseFloat(preferenceParts[1]);
        preferenceParts[1] = quality ? quality : 0.0;
      }
      preferences[preferenceParts[0]] = preferenceParts[1];

      return preferenceParts[0];
    }).filter(function(lang) {
      return preferences[lang] > 0;
    }).sort(function sortLanguages(a, b) {
      return preferences[b] - preferences[a];
    });
  };

  /**
   * searches for locale in given object
   */

  var getLocaleFromObject = function(obj) {
    var locale;
    if (obj && obj.scope) {
      locale = obj.scope.locale;
    }
    if (obj && obj.locale) {
      locale = obj.locale;
    }
    return locale;
  };

  /**
   * splits and parses a phrase for mathematical interval expressions
   */
  var parsePluralInterval = function(phrase, count) {
    var returnPhrase = phrase;
    var phrases = phrase.split(/\|/);

    // some() breaks on 1st true
    phrases.some(function(p) {
      var matches = p.match(/^\s*([\(\)\[\]\d,]+)?\s*(.*)$/);

      // not the same as in combined condition
      if (matches[1]) {
        if (matchInterval(count, matches[1]) === true) {
          returnPhrase = matches[2];
          return true;
        }
      } else {
        returnPhrase = p;
      }

    });
    return returnPhrase;
  };

  /**
   * test a number to match mathematical interval expressions
   * [0,2] - 0 to 2 (including, matches: 0, 1, 2)
   * ]0,3[ - 0 to 3 (excluding, matches: 1, 2)
   * [1]   - 1 (matches: 1)
   * [20,] - all numbers ≥20 (matches: 20, 21, 22, ...)
   * [,20] - all numbers ≤20 (matches: 20, 21, 22, ...)
   */
  var matchInterval = function(number, interval) {
    interval = parseInterval(interval);
    if (interval && typeof number === 'number') {
      if (interval.from.value === number) {
        return interval.from.included;
      }
      if (interval.to.value === number) {
        return interval.to.included;
      }

      return (Math.min(interval.from.value, number) === interval.from.value &&
        Math.max(interval.to.value, number) === interval.to.value);
    }
    return false;
  };

  /**
   * read locale file, translate a msg and write to fs if new
   */
  var translate = function(locale, singular, plural, skipSyncToAllFiles) {

    // add same key to all translations
    if (!skipSyncToAllFiles && syncFiles) {
      syncToAllFiles(singular, plural);
    }

    if (locale === undefined) {
      logWarn('WARN: No locale found - check the context of the call to __(). Using ' +
        defaultLocale + ' as current locale');
      locale = defaultLocale;
    }

    if (!locales[locale] && fallbacks[locale]) {
      locale = fallbacks[locale];
    }

    // attempt to read when defined as valid locale
    if (!locales[locale]) {
      read(locale);
    }

    // fallback to default when missed
    if (!locales[locale]) {

      logWarn('WARN: Locale ' + locale +
        ' couldn\'t be read - check the context of the call to $__. Using ' +
        defaultLocale + ' (default) as current locale');

      locale = defaultLocale;
      read(locale);
    }

    // dotnotaction add on, @todo: factor out
    var defaultSingular = singular;
    var defaultPlural = plural;
    if (objectNotation) {
      var indexOfColon = singular.indexOf(':');
      // We compare against 0 instead of -1 because
      // we don't really expect the string to start with ':'.
      if (0 < indexOfColon) {
        defaultSingular = singular.substring(indexOfColon + 1);
        singular = singular.substring(0, indexOfColon);
      }
      if (plural && typeof plural !== 'number') {
        indexOfColon = plural.indexOf(':');
        if (0 < indexOfColon) {
          defaultPlural = plural.substring(indexOfColon + 1);
          plural = plural.substring(0, indexOfColon);
        }
      }
    }

    var accessor = localeAccessor(locale, singular);
    var mutator = localeMutator(locale, singular);

    if (plural) {
      if (!accessor()) {
        mutator({
          'one': defaultSingular || singular,
          'other': defaultPlural || plural
        });
        write(locale);
      }
    }

    if (!accessor()) {
      mutator(defaultSingular || singular);
      write(locale);
    }

    return accessor();
  };

  /**
   * initialize the same key in all locales
   * when not already existing, checked via translate
   */
  var syncToAllFiles = function(singular, plural) {
    // iterate over locales and translate again
    // this will implicitly write/sync missing keys
    // to the rest of locales
    for (var l in locales) {
      translate(l, singular, plural, true);
    }
  };

  /**
   * Allows delayed access to translations nested inside objects.
   * @param {String} locale The locale to use.
   * @param {String} singular The singular term to look up.
   * @param {Boolean} [allowDelayedTraversal=true] Is delayed traversal of the tree allowed?
   * This parameter is used internally. It allows to signal the accessor that
   * a translation was not found in the initial lookup and that an invocation
   * of the accessor may trigger another traversal of the tree.
   * @returns {Function} A function that, when invoked, returns the current value stored
   * in the object at the requested location.
   */
  var localeAccessor = function(locale, singular, allowDelayedTraversal) {
    // Bail out on non-existent locales to defend against internal errors.
    if (!locales[locale]) return Function.prototype;

    // Handle object lookup notation
    var indexOfDot = objectNotation && singular.indexOf(objectNotation);
    if (objectNotation && (0 < indexOfDot && indexOfDot < singular.length)) {
      // If delayed traversal wasn't specifically forbidden, it is allowed.
      if (typeof allowDelayedTraversal === 'undefined') allowDelayedTraversal = true;
      // The accessor we're trying to find and which we want to return.
      var accessor = null;
      // An accessor that returns null.
      var nullAccessor = function() {
        return null;
      };
      // Do we need to re-traverse the tree upon invocation of the accessor?
      var reTraverse = false;
      // Split the provided term and run the callback for each subterm.
      singular.split(objectNotation).reduce(function(object, index) {
        // Make the accessor return null.
        accessor = nullAccessor;
        // If our current target object (in the locale tree) doesn't exist or
        // it doesn't have the next subterm as a member...
        if (null === object || !object.hasOwnProperty(index)) {
          // ...remember that we need retraversal (because we didn't find our target).
          reTraverse = allowDelayedTraversal;
          // Return null to avoid deeper iterations.
          return null;
        }
        // We can traverse deeper, so we generate an accessor for this current level.
        accessor = function() {
          return object[index];
        };
        // Return a reference to the next deeper level in the locale tree.
        return object[index];

      }, locales[locale]);
      // Return the requested accessor.
      return function() {
        // If we need to re-traverse (because we didn't find our target term)
        // traverse again and return the new result (but don't allow further iterations)
        // or return the previously found accessor if it was already valid.
        return (reTraverse) ? localeAccessor(locale, singular, false)() : accessor();
      };

    } else {
      // No object notation, just return an accessor that performs array lookup.
      return function() {
        return locales[locale][singular];
      };
    }
  };

  /**
   * Allows delayed mutation of a translation nested inside objects.
   * @description Construction of the mutator will attempt to locate the requested term
   * inside the object, but if part of the branch does not exist yet, it will not be
   * created until the mutator is actually invoked. At that point, re-traversal of the
   * tree is performed and missing parts along the branch will be created.
   * @param {String} locale The locale to use.
   * @param {String} singular The singular term to look up.
   * @param [Boolean} [allowBranching=false] Is the mutator allowed to create previously
   * non-existent branches along the requested locale path?
   * @returns {Function} A function that takes one argument. When the function is
   * invoked, the targeted translation term will be set to the given value inside the locale table.
   */
  var localeMutator = function(locale, singular, allowBranching) {
    // Bail out on non-existent locales to defend against internal errors.
    if (!locales[locale]) return Function.prototype;

    // Handle object lookup notation
    var indexOfDot = objectNotation && singular.indexOf(objectNotation);
    if (objectNotation && (0 < indexOfDot && indexOfDot < singular.length)) {
      // If branching wasn't specifically allowed, disable it.
      if (typeof allowBranching === 'undefined') allowBranching = false;
      // This will become the function we want to return.
      var accessor = null;
      // An accessor that takes one argument and returns null.
      var nullAccessor = function() {
        return null;
      };
      // Are we going to need to re-traverse the tree when the mutator is invoked?
      var reTraverse = false;
      // Split the provided term and run the callback for each subterm.
      singular.split(objectNotation).reduce(function(object, index) {
        // Make the mutator do nothing.
        accessor = nullAccessor;
        // If our current target object (in the locale tree) doesn't exist or
        // it doesn't have the next subterm as a member...
        if (null === object || !object.hasOwnProperty(index)) {
          // ...check if we're allowed to create new branches.
          if (allowBranching) {
            // If we are allowed to, create a new object along the path.
            object[index] = {};
          } else {
            // If we aren't allowed, remember that we need to re-traverse later on and...
            reTraverse = true;
            // ...return null to make the next iteration bail our early on.
            return null;
          }
        }
        // Generate a mutator for the current level.
        accessor = function(value) {
          object[index] = value;
          return value;
        };

        // Return a reference to the next deeper level in the locale tree.
        return object[index];

      }, locales[locale]);

      // Return the final mutator.
      return function(value) {
        // If we need to re-traverse the tree
        // invoke the search again, but allow branching
        // this time (because here the mutator is being invoked)
        // otherwise, just change the value directly.
        return (reTraverse) ? localeMutator(locale, singular, true)(value) : accessor(value);
      };

    } else {
      // No object notation, just return a mutator that performs array lookup and changes the value.
      return function(value) {
        locales[locale][singular] = value;
        return value;
      };
    }
  };

  /**
   * try reading a file
   */
  var read = function(locale) {
    var localeFile = {},
      file = getStorageFilePath(locale);
    try {
      logDebug('read ' + file + ' for locale: ' + locale);
      localeFile = fs.readFileSync(file);
      try {
        // parsing filecontents to locales[locale]
        locales[locale] = JSON.parse(localeFile);
      } catch (parseError) {
        logError('unable to parse locales from file (maybe ' +
          file + ' is empty or invalid json?): ', parseError);
      }
    } catch (readError) {
      // unable to read, so intialize that file
      // locales[locale] are already set in memory, so no extra read required
      // or locales[locale] are empty, which initializes an empty locale.json file

      // since the current invalid locale could exist, we should back it up
      if (fs.existsSync(file)) {
        logDebug('backing up invalid locale ' + locale + ' to ' + file + '.invalid');
        fs.renameSync(file, file + '.invalid');
      }

      logDebug('initializing ' + file);
      write(locale);
    }
  };

  /**
   * try writing a file in a created directory
   */
  var write = function(locale) {
    var stats, target, tmp;

    // don't write new locale information to disk if updateFiles isn't true
    if (!updateFiles) {
      return;
    }

    // creating directory if necessary
    try {
      stats = fs.lstatSync(directory);
    } catch (e) {
      logDebug('creating locales dir in: ' + directory);
      fs.mkdirSync(directory, directoryPermissions);
    }

    // first time init has an empty file
    if (!locales[locale]) {
      locales[locale] = {};
    }

    // writing to tmp and rename on success
    try {
      target = getStorageFilePath(locale);
      tmp = target + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(locales[locale], null, indent), 'utf8');
      stats = fs.statSync(tmp);
      if (stats.isFile()) {
        fs.renameSync(tmp, target);
      } else {
        logError('unable to write locales to file (either ' +
          tmp + ' or ' + target + ' are not writeable?): ');
      }
    } catch (e) {
      logError('unexpected error writing files (either ' +
        tmp + ' or ' + target + ' are not writeable?): ', e);
    }
  };

  /**
   * basic normalization of filepath
   */
  var getStorageFilePath = function(locale) {
    // changed API to use .json as default, #16
    var ext = extension || '.json',
      filepath = path.normalize(directory + pathsep + prefix + locale + ext),
      filepathJS = path.normalize(directory + pathsep + prefix + locale + '.js');
    // use .js as fallback if already existing
    try {
      if (fs.statSync(filepathJS)) {
        logDebug('using existing file ' + filepathJS);
        extension = '.js';
        return filepathJS;
      }
    } catch (e) {
      logDebug('will use ' + filepath);
    }
    return filepath;
  };

  /**
   * Logging proxies
   */
  function logDebug(msg) {
    logDebugFn(msg);
  }

  function logWarn(msg) {
    logWarnFn(msg);
  }

  function logError(msg) {
    logErrorFn(msg);
  }

  return i18n;

}());