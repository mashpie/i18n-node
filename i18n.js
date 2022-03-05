/**
 * @author      Created by Marcus Spiegel <spiegel@uscreen.de> on 2011-03-25.
 * @link        https://github.com/mashpie/i18n-node
 * @license     http://opensource.org/licenses/MIT
 */

'use strict'

// dependencies
const printf = require('fast-printf').printf
const pkgVersion = require('./package.json').version
const fs = require('fs')
const url = require('url')
const path = require('path')
const debug = require('debug')('i18n:debug')
const warn = require('debug')('i18n:warn')
const error = require('debug')('i18n:error')
const Mustache = require('mustache')
const Messageformat = require('@messageformat/core')
const MakePlural = require('make-plural')
const parseInterval = require('math-interval-parser').default

// utils
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string

/**
 * create constructor function
 */
const i18n = function I18n(_OPTS = false) {
  const MessageformatInstanceForLocale = {}
  const PluralsForLocale = {}
  let locales = {}
  const api = {
    __: '__',
    __n: '__n',
    __l: '__l',
    __h: '__h',
    __mf: '__mf',
    getLocale: 'getLocale',
    setLocale: 'setLocale',
    getCatalog: 'getCatalog',
    getLocales: 'getLocales',
    addLocale: 'addLocale',
    removeLocale: 'removeLocale'
  }
  const mustacheConfig = {
    tags: ['{{', '}}'],
    disable: false
  }
  let mustacheRegex
  const pathsep = path.sep // ---> means win support will be available in node 0.8.x and above
  let autoReload
  let cookiename
  let languageHeaderName
  let defaultLocale
  let retryInDefaultLocale
  let directory
  let directoryPermissions
  let extension
  let fallbacks
  let indent
  let logDebugFn
  let logErrorFn
  let logWarnFn
  let preserveLegacyCase
  let objectNotation
  let prefix
  let queryParameter
  let register
  let updateFiles
  let syncFiles
  let missingKeyFn

  // public exports
  const i18n = {}

  i18n.version = pkgVersion

  i18n.configure = function i18nConfigure(opt) {
    // reset locales
    locales = {}

    // Provide custom API method aliases if desired
    // This needs to be processed before the first call to applyAPItoObject()
    if (opt.api && typeof opt.api === 'object') {
      for (const method in opt.api) {
        if (Object.prototype.hasOwnProperty.call(opt.api, method)) {
          const alias = opt.api[method]
          if (typeof api[method] !== 'undefined') {
            api[method] = alias
          }
        }
      }
    }

    // you may register i18n in global scope, up to you
    if (typeof opt.register === 'object') {
      register = opt.register
      // or give an array objects to register to
      if (Array.isArray(opt.register)) {
        register = opt.register
        register.forEach(applyAPItoObject)
      } else {
        applyAPItoObject(opt.register)
      }
    }

    // sets a custom cookie name to parse locale settings from
    cookiename = typeof opt.cookie === 'string' ? opt.cookie : null

    // set the custom header name to extract the language locale
    languageHeaderName =
      typeof opt.header === 'string' ? opt.header : 'accept-language'

    // query-string parameter to be watched - @todo: add test & doc
    queryParameter =
      typeof opt.queryParameter === 'string' ? opt.queryParameter : null

    // where to store json files
    directory =
      typeof opt.directory === 'string'
        ? opt.directory
        : path.join(__dirname, 'locales')

    // permissions when creating new directories
    directoryPermissions =
      typeof opt.directoryPermissions === 'string'
        ? parseInt(opt.directoryPermissions, 8)
        : null

    // write new locale information to disk
    updateFiles = typeof opt.updateFiles === 'boolean' ? opt.updateFiles : true

    // sync locale information accros all files
    syncFiles = typeof opt.syncFiles === 'boolean' ? opt.syncFiles : false

    // what to use as the indentation unit (ex: "\t", "  ")
    indent = typeof opt.indent === 'string' ? opt.indent : '\t'

    // json files prefix
    prefix = typeof opt.prefix === 'string' ? opt.prefix : ''

    // where to store json files
    extension = typeof opt.extension === 'string' ? opt.extension : '.json'

    // setting defaultLocale
    defaultLocale =
      typeof opt.defaultLocale === 'string' ? opt.defaultLocale : 'en'

    // allow to retry in default locale, useful for production
    retryInDefaultLocale =
      typeof opt.retryInDefaultLocale === 'boolean'
        ? opt.retryInDefaultLocale
        : false

    // auto reload locale files when changed
    autoReload = typeof opt.autoReload === 'boolean' ? opt.autoReload : false

    // enable object notation?
    objectNotation =
      typeof opt.objectNotation !== 'undefined' ? opt.objectNotation : false
    if (objectNotation === true) objectNotation = '.'

    // read language fallback map
    fallbacks = typeof opt.fallbacks === 'object' ? opt.fallbacks : {}

    // setting custom logger functions
    logDebugFn = typeof opt.logDebugFn === 'function' ? opt.logDebugFn : debug
    logWarnFn = typeof opt.logWarnFn === 'function' ? opt.logWarnFn : warn
    logErrorFn = typeof opt.logErrorFn === 'function' ? opt.logErrorFn : error

    preserveLegacyCase =
      typeof opt.preserveLegacyCase === 'boolean'
        ? opt.preserveLegacyCase
        : true

    // setting custom missing key function
    missingKeyFn =
      typeof opt.missingKeyFn === 'function' ? opt.missingKeyFn : missingKey

    // when missing locales we try to guess that from directory
    opt.locales = opt.staticCatalog
      ? Object.keys(opt.staticCatalog)
      : opt.locales || guessLocales(directory)

    // some options should be disabled when using staticCatalog
    if (opt.staticCatalog) {
      updateFiles = false
      autoReload = false
      syncFiles = false
    }

    // customize mustache parsing
    if (opt.mustacheConfig) {
      if (Array.isArray(opt.mustacheConfig.tags)) {
        mustacheConfig.tags = opt.mustacheConfig.tags
      }
      if (opt.mustacheConfig.disable === true) {
        mustacheConfig.disable = true
      }
    }

    const [start, end] = mustacheConfig.tags
    mustacheRegex = new RegExp(escapeRegExp(start) + '.*' + escapeRegExp(end))

    // implicitly read all locales
    if (Array.isArray(opt.locales)) {
      if (opt.staticCatalog) {
        locales = opt.staticCatalog
      } else {
        opt.locales.forEach(read)
      }

      // auto reload locale files when changed
      if (autoReload) {
        // watch changes of locale files (it's called twice because fs.watch is still unstable)
        fs.watch(directory, (event, filename) => {
          const localeFromFile = guessLocaleFromFile(filename)

          if (localeFromFile && opt.locales.indexOf(localeFromFile) > -1) {
            logDebug('Auto reloading locale file "' + filename + '".')
            read(localeFromFile)
          }
        })
      }
    }
  }

  i18n.init = function i18nInit(request, response, next) {
    if (typeof request === 'object') {
      // guess requested language/locale
      guessLanguage(request)

      // bind api to req
      applyAPItoObject(request)

      // looks double but will ensure schema on api refactor
      i18n.setLocale(request, request.locale)
    } else {
      return logError(
        'i18n.init must be called with one parameter minimum, ie. i18n.init(req)'
      )
    }

    if (typeof response === 'object') {
      applyAPItoObject(response)

      // and set that locale to response too
      i18n.setLocale(response, request.locale)
    }

    // head over to next callback when bound as middleware
    if (typeof next === 'function') {
      return next()
    }
  }

  i18n.__ = function i18nTranslate(phrase) {
    let msg
    const argv = parseArgv(arguments)
    const namedValues = argv[0]
    const args = argv[1]

    // called like __({phrase: "Hello", locale: "en"})
    if (typeof phrase === 'object') {
      if (
        typeof phrase.locale === 'string' &&
        typeof phrase.phrase === 'string'
      ) {
        msg = translate(phrase.locale, phrase.phrase)
      }
    }
    // called like __("Hello")
    else {
      // get translated message with locale from scope (deprecated) or object
      msg = translate(getLocaleFromObject(this), phrase)
    }

    // postprocess to get compatible to plurals
    if (typeof msg === 'object' && msg.one) {
      msg = msg.one
    }

    // in case there is no 'one' but an 'other' rule
    if (typeof msg === 'object' && msg.other) {
      msg = msg.other
    }

    // head over to postProcessing
    return postProcess(msg, namedValues, args)
  }

  i18n.__mf = function i18nMessageformat(phrase) {
    let msg, mf, f
    let targetLocale = defaultLocale
    const argv = parseArgv(arguments)
    const namedValues = argv[0]
    const args = argv[1]

    // called like __({phrase: "Hello", locale: "en"})
    if (typeof phrase === 'object') {
      if (
        typeof phrase.locale === 'string' &&
        typeof phrase.phrase === 'string'
      ) {
        msg = phrase.phrase
        targetLocale = phrase.locale
      }
    }
    // called like __("Hello")
    else {
      // get translated message with locale from scope (deprecated) or object
      msg = phrase
      targetLocale = getLocaleFromObject(this)
    }

    msg = translate(targetLocale, msg)
    // --- end get msg

    // now head over to Messageformat
    // and try to cache instance
    if (MessageformatInstanceForLocale[targetLocale]) {
      mf = MessageformatInstanceForLocale[targetLocale]
    } else {
      mf = new Messageformat(targetLocale)

      mf.compiledFunctions = {}
      MessageformatInstanceForLocale[targetLocale] = mf
    }

    // let's try to cache that function
    if (mf.compiledFunctions[msg]) {
      f = mf.compiledFunctions[msg]
    } else {
      f = mf.compile(msg)
      mf.compiledFunctions[msg] = f
    }

    return postProcess(f(namedValues), namedValues, args)
  }

  i18n.__l = function i18nTranslationList(phrase) {
    const translations = []
    Object.keys(locales)
      .sort()
      .forEach((l) => {
        translations.push(i18n.__({ phrase: phrase, locale: l }))
      })
    return translations
  }

  i18n.__h = function i18nTranslationHash(phrase) {
    const translations = []
    Object.keys(locales)
      .sort()
      .forEach((l) => {
        const hash = {}
        hash[l] = i18n.__({ phrase: phrase, locale: l })
        translations.push(hash)
      })
    return translations
  }

  i18n.__n = function i18nTranslatePlural(singular, plural, count) {
    let msg
    let namedValues
    let targetLocale
    let args = []

    // Accept an object with named values as the last parameter
    if (argsEndWithNamedObject(arguments)) {
      namedValues = arguments[arguments.length - 1]
      args =
        arguments.length >= 5
          ? Array.prototype.slice.call(arguments, 3, -1)
          : []
    } else {
      namedValues = {}
      args =
        arguments.length >= 4 ? Array.prototype.slice.call(arguments, 3) : []
    }

    // called like __n({singular: "%s cat", plural: "%s cats", locale: "en"}, 3)
    if (typeof singular === 'object') {
      if (
        typeof singular.locale === 'string' &&
        typeof singular.singular === 'string' &&
        typeof singular.plural === 'string'
      ) {
        targetLocale = singular.locale
        msg = translate(singular.locale, singular.singular, singular.plural)
      }
      args.unshift(count)

      // some template engines pass all values as strings -> so we try to convert them to numbers
      if (typeof plural === 'number' || Number(plural) + '' === plural) {
        count = plural
      }

      // called like __n({singular: "%s cat", plural: "%s cats", locale: "en", count: 3})
      if (
        typeof singular.count === 'number' ||
        typeof singular.count === 'string'
      ) {
        count = singular.count
        args.unshift(plural)
      }
    } else {
      // called like  __n('cat', 3)
      if (typeof plural === 'number' || Number(plural) + '' === plural) {
        count = plural

        // we add same string as default
        // which efectivly copies the key to the plural.value
        // this is for initialization of new empty translations
        plural = singular

        args.unshift(count)
        args.unshift(plural)
      }
      // called like __n('%s cat', '%s cats', 3)
      // get translated message with locale from scope (deprecated) or object
      msg = translate(getLocaleFromObject(this), singular, plural)
      targetLocale = getLocaleFromObject(this)
    }

    if (count === null) count = namedValues.count

    // enforce number
    count = Number(count)

    // find the correct plural rule for given locale
    if (typeof msg === 'object') {
      let p
      // create a new Plural for locale
      // and try to cache instance
      if (PluralsForLocale[targetLocale]) {
        p = PluralsForLocale[targetLocale]
      } else {
        // split locales with a region code
        const lc = targetLocale
          .toLowerCase()
          .split(/[_-\s]+/)
          .filter((el) => true && el)
        // take the first part of locale, fallback to full locale
        p = MakePlural[lc[0] || targetLocale]
        PluralsForLocale[targetLocale] = p
      }

      // fallback to 'other' on case of missing translations
      msg = msg[p(count)] || msg.other
    }

    // head over to postProcessing
    return postProcess(msg, namedValues, args, count)
  }

  i18n.setLocale = function i18nSetLocale(object, locale, skipImplicitObjects) {
    // when given an array of objects => setLocale on each
    if (Array.isArray(object) && typeof locale === 'string') {
      for (let i = object.length - 1; i >= 0; i--) {
        i18n.setLocale(object[i], locale, true)
      }
      return i18n.getLocale(object[0])
    }

    // defaults to called like i18n.setLocale(req, 'en')
    let targetObject = object
    let targetLocale = locale

    // called like req.setLocale('en') or i18n.setLocale('en')
    if (locale === undefined && typeof object === 'string') {
      targetObject = this
      targetLocale = object
    }

    // consider a fallback
    if (!locales[targetLocale]) {
      targetLocale = getFallback(targetLocale, fallbacks) || targetLocale
    }

    // now set locale on object
    targetObject.locale = locales[targetLocale] ? targetLocale : defaultLocale

    // consider any extra registered objects
    if (typeof register === 'object') {
      if (Array.isArray(register) && !skipImplicitObjects) {
        register.forEach((r) => {
          r.locale = targetObject.locale
        })
      } else {
        register.locale = targetObject.locale
      }
    }

    // consider res
    if (targetObject.res && !skipImplicitObjects) {
      // escape recursion
      // @see  - https://github.com/balderdashy/sails/pull/3631
      //       - https://github.com/mashpie/i18n-node/pull/218
      if (targetObject.res.locals) {
        i18n.setLocale(targetObject.res, targetObject.locale, true)
        i18n.setLocale(targetObject.res.locals, targetObject.locale, true)
      } else {
        i18n.setLocale(targetObject.res, targetObject.locale)
      }
    }

    // consider locals
    if (targetObject.locals && !skipImplicitObjects) {
      // escape recursion
      // @see  - https://github.com/balderdashy/sails/pull/3631
      //       - https://github.com/mashpie/i18n-node/pull/218
      if (targetObject.locals.res) {
        i18n.setLocale(targetObject.locals, targetObject.locale, true)
        i18n.setLocale(targetObject.locals.res, targetObject.locale, true)
      } else {
        i18n.setLocale(targetObject.locals, targetObject.locale)
      }
    }

    return i18n.getLocale(targetObject)
  }

  i18n.getLocale = function i18nGetLocale(request) {
    // called like i18n.getLocale(req)
    if (request && request.locale) {
      return request.locale
    }

    // called like req.getLocale()
    return this.locale || defaultLocale
  }

  i18n.getCatalog = function i18nGetCatalog(object, locale) {
    let targetLocale

    // called like i18n.getCatalog(req)
    if (
      typeof object === 'object' &&
      typeof object.locale === 'string' &&
      locale === undefined
    ) {
      targetLocale = object.locale
    }

    // called like i18n.getCatalog(req, 'en')
    if (
      !targetLocale &&
      typeof object === 'object' &&
      typeof locale === 'string'
    ) {
      targetLocale = locale
    }

    // called like req.getCatalog('en')
    if (!targetLocale && locale === undefined && typeof object === 'string') {
      targetLocale = object
    }

    // called like req.getCatalog()
    if (
      !targetLocale &&
      object === undefined &&
      locale === undefined &&
      typeof this.locale === 'string'
    ) {
      if (register && register.global) {
        targetLocale = ''
      } else {
        targetLocale = this.locale
      }
    }

    // called like i18n.getCatalog()
    if (targetLocale === undefined || targetLocale === '') {
      return locales
    }

    if (!locales[targetLocale]) {
      targetLocale = getFallback(targetLocale, fallbacks) || targetLocale
    }

    if (locales[targetLocale]) {
      return locales[targetLocale]
    } else {
      logWarn('No catalog found for "' + targetLocale + '"')
      return false
    }
  }

  i18n.getLocales = function i18nGetLocales() {
    return Object.keys(locales)
  }

  i18n.addLocale = function i18nAddLocale(locale) {
    read(locale)
  }

  i18n.removeLocale = function i18nRemoveLocale(locale) {
    delete locales[locale]
  }

  // ===================
  // = private methods =
  // ===================

  const postProcess = (msg, namedValues, args, count) => {
    // test for parsable interval string
    if (/\|/.test(msg)) {
      msg = parsePluralInterval(msg, count)
    }

    // replace the counter
    if (typeof count === 'number') {
      msg = printf(msg, Number(count))
    }

    // if the msg string contains {{Mustache}} patterns we render it as a mini template
    if (!mustacheConfig.disable && mustacheRegex.test(msg)) {
      msg = Mustache.render(msg, namedValues, {}, mustacheConfig.tags)
    }

    // if we have extra arguments with values to get replaced,
    // an additional substition injects those strings afterwards
    if (/%/.test(msg) && args && args.length > 0) {
      msg = printf(msg, ...args)
    }

    return msg
  }

  const argsEndWithNamedObject = (args) =>
    args.length > 1 &&
    args[args.length - 1] !== null &&
    typeof args[args.length - 1] === 'object'

  const parseArgv = (args) => {
    let namedValues, returnArgs

    if (argsEndWithNamedObject(args)) {
      namedValues = args[args.length - 1]
      returnArgs = Array.prototype.slice.call(args, 1, -1)
    } else {
      namedValues = {}
      returnArgs = args.length >= 2 ? Array.prototype.slice.call(args, 1) : []
    }

    return [namedValues, returnArgs]
  }

  /**
   * registers all public API methods to a given response object when not already declared
   */
  const applyAPItoObject = (object) => {
    let alreadySetted = true

    // attach to itself if not provided
    for (const method in api) {
      if (Object.prototype.hasOwnProperty.call(api, method)) {
        const alias = api[method]

        // be kind rewind, or better not touch anything already existing
        if (!object[alias]) {
          alreadySetted = false
          object[alias] = i18n[method].bind(object)
        }
      }
    }

    // set initial locale if not set
    if (!object.locale) {
      object.locale = defaultLocale
    }

    // escape recursion
    if (alreadySetted) {
      return
    }

    // attach to response if present (ie. in express)
    if (object.res) {
      applyAPItoObject(object.res)
    }

    // attach to locals if present (ie. in express)
    if (object.locals) {
      applyAPItoObject(object.locals)
    }
  }

  /**
   * tries to guess locales by scanning the given directory
   */
  const guessLocales = (directory) => {
    const entries = fs.readdirSync(directory)
    const localesFound = []

    for (let i = entries.length - 1; i >= 0; i--) {
      if (entries[i].match(/^\./)) continue
      const localeFromFile = guessLocaleFromFile(entries[i])
      if (localeFromFile) localesFound.push(localeFromFile)
    }

    return localesFound.sort()
  }

  /**
   * tries to guess locales from a given filename
   */
  const guessLocaleFromFile = (filename) => {
    const extensionRegex = new RegExp(extension + '$', 'g')
    const prefixRegex = new RegExp('^' + prefix, 'g')

    if (!filename) return false
    if (prefix && !filename.match(prefixRegex)) return false
    if (extension && !filename.match(extensionRegex)) return false
    return filename.replace(prefix, '').replace(extensionRegex, '')
  }

  /**
   * @param queryLanguage - language query parameter, either an array or a string.
   * @return the first non-empty language query parameter found, null otherwise.
   */
  const extractQueryLanguage = (queryLanguage) => {
    if (Array.isArray(queryLanguage)) {
      return queryLanguage.find((lang) => lang !== '' && lang)
    }
    return typeof queryLanguage === 'string' && queryLanguage
  }

  /**
   * guess language setting based on http headers
   */

  const guessLanguage = (request) => {
    if (typeof request === 'object') {
      const languageHeader = request.headers
        ? request.headers[languageHeaderName]
        : undefined
      const languages = []
      const regions = []

      request.languages = [defaultLocale]
      request.regions = [defaultLocale]
      request.language = defaultLocale
      request.region = defaultLocale

      // a query parameter overwrites all
      if (queryParameter && request.url) {
        const urlAsString =
          typeof request.url === 'string' ? request.url : request.url.toString()

        /**
         * @todo WHATWG new URL() requires full URL including hostname - that might change
         * @see https://github.com/nodejs/node/issues/12682
         */
        // eslint-disable-next-line node/no-deprecated-api
        const urlObj = url.parse(urlAsString, true)
        const languageQueryParameter = urlObj.query[queryParameter]
        if (languageQueryParameter) {
          let queryLanguage = extractQueryLanguage(languageQueryParameter)
          if (queryLanguage) {
            logDebug('Overriding locale from query: ' + queryLanguage)
            if (preserveLegacyCase) {
              queryLanguage = queryLanguage.toLowerCase()
            }
            return i18n.setLocale(request, queryLanguage)
          }
        }
      }

      // a cookie overwrites headers
      if (cookiename && request.cookies && request.cookies[cookiename]) {
        request.language = request.cookies[cookiename]
        return i18n.setLocale(request, request.language)
      }

      // 'accept-language' is the most common source
      if (languageHeader) {
        const acceptedLanguages = getAcceptedLanguagesFromHeader(languageHeader)
        let match
        let fallbackMatch
        let fallback
        for (let i = 0; i < acceptedLanguages.length; i++) {
          const lang = acceptedLanguages[i]
          const lr = lang.split('-', 2)
          const parentLang = lr[0]
          const region = lr[1]

          // Check if we have a configured fallback set for this language.
          const fallbackLang = getFallback(lang, fallbacks)
          if (fallbackLang) {
            fallback = fallbackLang
            // Fallbacks for languages should be inserted
            // where the original, unsupported language existed.
            const acceptedLanguageIndex = acceptedLanguages.indexOf(lang)
            const fallbackIndex = acceptedLanguages.indexOf(fallback)
            if (fallbackIndex > -1) {
              acceptedLanguages.splice(fallbackIndex, 1)
            }
            acceptedLanguages.splice(acceptedLanguageIndex + 1, 0, fallback)
          }

          // Check if we have a configured fallback set for the parent language of the locale.
          const fallbackParentLang = getFallback(parentLang, fallbacks)
          if (fallbackParentLang) {
            fallback = fallbackParentLang
            // Fallbacks for a parent language should be inserted
            // to the end of the list, so they're only picked
            // if there is no better match.
            if (acceptedLanguages.indexOf(fallback) < 0) {
              acceptedLanguages.push(fallback)
            }
          }

          if (languages.indexOf(parentLang) < 0) {
            languages.push(parentLang.toLowerCase())
          }
          if (region) {
            regions.push(region.toLowerCase())
          }

          if (!match && locales[lang]) {
            match = lang
            break
          }

          if (!fallbackMatch && locales[parentLang]) {
            fallbackMatch = parentLang
          }
        }

        request.language = match || fallbackMatch || request.language
        request.region = regions[0] || request.region
        return i18n.setLocale(request, request.language)
      }
    }

    // last resort: defaultLocale
    return i18n.setLocale(request, defaultLocale)
  }

  /**
   * Get a sorted list of accepted languages from the HTTP Accept-Language header
   */
  const getAcceptedLanguagesFromHeader = (header) => {
    const languages = header.split(',')
    const preferences = {}
    return languages
      .map((item) => {
        const preferenceParts = item.trim().split(';q=')
        if (preferenceParts.length < 2) {
          preferenceParts[1] = 1.0
        } else {
          const quality = parseFloat(preferenceParts[1])
          preferenceParts[1] = quality || 0.0
        }
        preferences[preferenceParts[0]] = preferenceParts[1]

        return preferenceParts[0]
      })
      .filter((lang) => preferences[lang] > 0)
      .sort((a, b) => preferences[b] - preferences[a])
  }

  /**
   * searches for locale in given object
   */

  const getLocaleFromObject = (obj) => {
    let locale
    if (obj && obj.scope) {
      locale = obj.scope.locale
    }
    if (obj && obj.locale) {
      locale = obj.locale
    }
    return locale
  }

  /**
   * splits and parses a phrase for mathematical interval expressions
   */
  const parsePluralInterval = (phrase, count) => {
    let returnPhrase = phrase
    const phrases = phrase.split(/\|/)
    let intervalRuleExists = false

    // some() breaks on 1st true
    phrases.some((p) => {
      const matches = p.match(/^\s*([()[\]]+[\d,]+[()[\]]+)?\s*(.*)$/)

      // not the same as in combined condition
      if (matches != null && matches[1]) {
        intervalRuleExists = true
        if (matchInterval(count, matches[1]) === true) {
          returnPhrase = matches[2]
          return true
        }
      } else {
        // this is a other or catch all case, this only is taken into account if there is actually another rule
        if (intervalRuleExists) {
          returnPhrase = p
        }
      }
      return false
    })
    return returnPhrase
  }

  /**
   * test a number to match mathematical interval expressions
   * [0,2] - 0 to 2 (including, matches: 0, 1, 2)
   * ]0,3[ - 0 to 3 (excluding, matches: 1, 2)
   * [1]   - 1 (matches: 1)
   * [20,] - all numbers ≥20 (matches: 20, 21, 22, ...)
   * [,20] - all numbers ≤20 (matches: 20, 21, 22, ...)
   */
  const matchInterval = (number, interval) => {
    interval = parseInterval(interval)
    if (interval && typeof number === 'number') {
      if (interval.from.value === number) {
        return interval.from.included
      }
      if (interval.to.value === number) {
        return interval.to.included
      }

      return (
        Math.min(interval.from.value, number) === interval.from.value &&
        Math.max(interval.to.value, number) === interval.to.value
      )
    }
    return false
  }

  /**
   * read locale file, translate a msg and write to fs if new
   */
  const translate = (locale, singular, plural, skipSyncToAllFiles) => {
    // add same key to all translations
    if (!skipSyncToAllFiles && syncFiles) {
      syncToAllFiles(singular, plural)
    }

    if (locale === undefined) {
      logWarn(
        'WARN: No locale found - check the context of the call to __(). Using ' +
          defaultLocale +
          ' as current locale'
      )
      locale = defaultLocale
    }

    // try to get a fallback
    if (!locales[locale]) {
      locale = getFallback(locale, fallbacks) || locale
    }

    // attempt to read when defined as valid locale
    if (!locales[locale]) {
      read(locale)
    }

    // fallback to default when missed
    if (!locales[locale]) {
      logWarn(
        'WARN: Locale ' +
          locale +
          " couldn't be read - check the context of the call to $__. Using " +
          defaultLocale +
          ' (default) as current locale'
      )

      locale = defaultLocale
      read(locale)
    }

    // dotnotaction add on, @todo: factor out
    let defaultSingular = singular
    let defaultPlural = plural
    if (objectNotation) {
      let indexOfColon = singular.indexOf(':')
      // We compare against 0 instead of -1 because
      // we don't really expect the string to start with ':'.
      if (indexOfColon > 0) {
        defaultSingular = singular.substring(indexOfColon + 1)
        singular = singular.substring(0, indexOfColon)
      }
      if (plural && typeof plural !== 'number') {
        indexOfColon = plural.indexOf(':')
        if (indexOfColon > 0) {
          defaultPlural = plural.substring(indexOfColon + 1)
          plural = plural.substring(0, indexOfColon)
        }
      }
    }

    const accessor = localeAccessor(locale, singular)
    const mutator = localeMutator(locale, singular)

    // if (plural) {
    //   if (accessor() == null) {
    //     mutator({
    //       'one': defaultSingular || singular,
    //       'other': defaultPlural || plural
    //     });
    //     write(locale);
    //   }
    // }
    // if (accessor() == null) {
    //   mutator(defaultSingular || singular);
    //   write(locale);
    // }
    if (plural) {
      if (accessor() == null) {
        // when retryInDefaultLocale is true - try to set default value from defaultLocale
        if (retryInDefaultLocale && locale !== defaultLocale) {
          logDebug(
            'Missing ' +
              singular +
              ' in ' +
              locale +
              ' retrying in ' +
              defaultLocale
          )
          mutator(translate(defaultLocale, singular, plural, true))
        } else {
          mutator({
            one: defaultSingular || singular,
            other: defaultPlural || plural
          })
        }
        write(locale)
      }
    }

    if (accessor() == null) {
      // when retryInDefaultLocale is true - try to set default value from defaultLocale
      if (retryInDefaultLocale && locale !== defaultLocale) {
        logDebug(
          'Missing ' +
            singular +
            ' in ' +
            locale +
            ' retrying in ' +
            defaultLocale
        )
        mutator(translate(defaultLocale, singular, plural, true))
      } else {
        mutator(defaultSingular || singular)
      }
      write(locale)
    }

    return accessor()
  }

  /**
   * initialize the same key in all locales
   * when not already existing, checked via translate
   */
  const syncToAllFiles = (singular, plural) => {
    // iterate over locales and translate again
    // this will implicitly write/sync missing keys
    // to the rest of locales
    for (const l in locales) {
      translate(l, singular, plural, true)
    }
  }

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
  const localeAccessor = (locale, singular, allowDelayedTraversal) => {
    // Bail out on non-existent locales to defend against internal errors.
    if (!locales[locale]) return Function.prototype

    // Handle object lookup notation
    const indexOfDot = objectNotation && singular.lastIndexOf(objectNotation)
    if (objectNotation && indexOfDot > 0 && indexOfDot < singular.length - 1) {
      // If delayed traversal wasn't specifically forbidden, it is allowed.
      if (typeof allowDelayedTraversal === 'undefined')
        allowDelayedTraversal = true
      // The accessor we're trying to find and which we want to return.
      let accessor = null
      // An accessor that returns null.
      const nullAccessor = () => null
      // Do we need to re-traverse the tree upon invocation of the accessor?
      let reTraverse = false
      // Split the provided term and run the callback for each subterm.
      singular.split(objectNotation).reduce((object, index) => {
        // Make the accessor return null.
        accessor = nullAccessor
        // If our current target object (in the locale tree) doesn't exist or
        // it doesn't have the next subterm as a member...
        if (
          object === null ||
          !Object.prototype.hasOwnProperty.call(object, index)
        ) {
          // ...remember that we need retraversal (because we didn't find our target).
          reTraverse = allowDelayedTraversal
          // Return null to avoid deeper iterations.
          return null
        }
        // We can traverse deeper, so we generate an accessor for this current level.
        accessor = () => object[index]
        // Return a reference to the next deeper level in the locale tree.
        return object[index]
      }, locales[locale])
      // Return the requested accessor.
      return () =>
        // If we need to re-traverse (because we didn't find our target term)
        // traverse again and return the new result (but don't allow further iterations)
        // or return the previously found accessor if it was already valid.
        reTraverse ? localeAccessor(locale, singular, false)() : accessor()
    } else {
      // No object notation, just return an accessor that performs array lookup.
      return () => locales[locale][singular]
    }
  }

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
  const localeMutator = function (locale, singular, allowBranching) {
    // Bail out on non-existent locales to defend against internal errors.
    if (!locales[locale]) return Function.prototype

    // Handle object lookup notation
    const indexOfDot = objectNotation && singular.lastIndexOf(objectNotation)
    if (objectNotation && indexOfDot > 0 && indexOfDot < singular.length - 1) {
      // If branching wasn't specifically allowed, disable it.
      if (typeof allowBranching === 'undefined') allowBranching = false
      // This will become the function we want to return.
      let accessor = null
      // An accessor that takes one argument and returns null.
      const nullAccessor = () => null
      // Fix object path.
      let fixObject = () => ({})
      // Are we going to need to re-traverse the tree when the mutator is invoked?
      let reTraverse = false
      // Split the provided term and run the callback for each subterm.
      singular.split(objectNotation).reduce((object, index) => {
        // Make the mutator do nothing.
        accessor = nullAccessor
        // If our current target object (in the locale tree) doesn't exist or
        // it doesn't have the next subterm as a member...
        if (
          object === null ||
          !Object.prototype.hasOwnProperty.call(object, index)
        ) {
          // ...check if we're allowed to create new branches.
          if (allowBranching) {
            // Fix `object` if `object` is not Object.
            if (object === null || typeof object !== 'object') {
              object = fixObject()
            }
            // If we are allowed to, create a new object along the path.
            object[index] = {}
          } else {
            // If we aren't allowed, remember that we need to re-traverse later on and...
            reTraverse = true
            // ...return null to make the next iteration bail our early on.
            return null
          }
        }
        // Generate a mutator for the current level.
        accessor = (value) => {
          object[index] = value
          return value
        }
        // Generate a fixer for the current level.
        fixObject = () => {
          object[index] = {}
          return object[index]
        }

        // Return a reference to the next deeper level in the locale tree.
        return object[index]
      }, locales[locale])

      // Return the final mutator.
      return (value) => {
        // If we need to re-traverse the tree
        // invoke the search again, but allow branching
        // this time (because here the mutator is being invoked)
        // otherwise, just change the value directly.
        value = missingKeyFn(locale, value)
        return reTraverse
          ? localeMutator(locale, singular, true)(value)
          : accessor(value)
      }
    } else {
      // No object notation, just return a mutator that performs array lookup and changes the value.
      return (value) => {
        value = missingKeyFn(locale, value)
        locales[locale][singular] = value
        return value
      }
    }
  }

  /**
   * try reading a file
   */
  const read = (locale) => {
    let localeFile = {}
    const file = getStorageFilePath(locale)
    try {
      logDebug('read ' + file + ' for locale: ' + locale)
      localeFile = fs.readFileSync(file)
      try {
        // parsing filecontents to locales[locale]
        locales[locale] = JSON.parse(localeFile)
      } catch (parseError) {
        logError(
          'unable to parse locales from file (maybe ' +
            file +
            ' is empty or invalid json?): ',
          parseError
        )
      }
    } catch (readError) {
      // unable to read, so intialize that file
      // locales[locale] are already set in memory, so no extra read required
      // or locales[locale] are empty, which initializes an empty locale.json file
      // since the current invalid locale could exist, we should back it up
      if (fs.existsSync(file)) {
        logDebug(
          'backing up invalid locale ' + locale + ' to ' + file + '.invalid'
        )
        fs.renameSync(file, file + '.invalid')
      }

      logDebug('initializing ' + file)
      write(locale)
    }
  }

  /**
   * try writing a file in a created directory
   */
  const write = (locale) => {
    let stats, target, tmp

    // don't write new locale information to disk if updateFiles isn't true
    if (!updateFiles) {
      return
    }

    // creating directory if necessary
    try {
      stats = fs.lstatSync(directory)
    } catch (e) {
      logDebug('creating locales dir in: ' + directory)
      try {
        fs.mkdirSync(directory, directoryPermissions)
      } catch (e) {
        // in case of parallel tasks utilizing in same dir
        if (e.code !== 'EEXIST') throw e
      }
    }

    // first time init has an empty file
    if (!locales[locale]) {
      locales[locale] = {}
    }

    // writing to tmp and rename on success
    try {
      target = getStorageFilePath(locale)
      tmp = target + '.tmp'
      fs.writeFileSync(
        tmp,
        JSON.stringify(locales[locale], null, indent),
        'utf8'
      )
      stats = fs.statSync(tmp)
      if (stats.isFile()) {
        fs.renameSync(tmp, target)
      } else {
        logError(
          'unable to write locales to file (either ' +
            tmp +
            ' or ' +
            target +
            ' are not writeable?): '
        )
      }
    } catch (e) {
      logError(
        'unexpected error writing files (either ' +
          tmp +
          ' or ' +
          target +
          ' are not writeable?): ',
        e
      )
    }
  }

  /**
   * basic normalization of filepath
   */
  const getStorageFilePath = (locale) => {
    // changed API to use .json as default, #16
    const ext = extension || '.json'
    const filepath = path.normalize(directory + pathsep + prefix + locale + ext)
    const filepathJS = path.normalize(
      directory + pathsep + prefix + locale + '.js'
    )
    // use .js as fallback if already existing
    try {
      if (fs.statSync(filepathJS)) {
        logDebug('using existing file ' + filepathJS)
        extension = '.js'
        return filepathJS
      }
    } catch (e) {
      logDebug('will use ' + filepath)
    }
    return filepath
  }

  /**
   * Get locales with wildcard support
   */
  const getFallback = (targetLocale, fallbacks) => {
    fallbacks = fallbacks || {}
    if (fallbacks[targetLocale]) return fallbacks[targetLocale]
    let fallBackLocale = null
    for (const key in fallbacks) {
      if (targetLocale.match(new RegExp('^' + key.replace('*', '.*') + '$'))) {
        fallBackLocale = fallbacks[key]
        break
      }
    }
    return fallBackLocale
  }

  /**
   * Logging proxies
   */
  const logDebug = (msg) => {
    logDebugFn(msg)
  }

  const logWarn = (msg) => {
    logWarnFn(msg)
  }

  const logError = (msg) => {
    logErrorFn(msg)
  }

  /**
   * Missing key function
   */
  const missingKey = (locale, value) => {
    return value
  }

  /**
   * implicitly configure when created with given options
   * @example
   * const i18n = new I18n({
   *   locales: ['en', 'fr']
   * });
   */
  if (_OPTS) i18n.configure(_OPTS)

  return i18n
}

module.exports = i18n
