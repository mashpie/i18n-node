# i18n

Lightweight simple translation module with dynamic JSON storage. Supports plain vanilla Node.js apps and should work with any framework (like _Express_, _restify_ and probably more) that exposes an `app.use()` method passing in `res` and `req` objects.
Uses common __('...') syntax in app and templates.
Stores language files in json files compatible to [webtranslateit](http://webtranslateit.com/) json format.
Adds new strings on-the-fly when first used in your app.
No extra parsing needed.

![Test](https://github.com/mashpie/i18n-node/actions/workflows/node.js.yml/badge.svg)
[![Test Coverage][coveralls-image]][coveralls-url]
[![NPM version][npm-image]][npm-url]
![npm](https://img.shields.io/npm/dw/i18n)
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![FOSSA Status][fossa-image]][fossa-url]

<p align="center">
<a href="https://www.buymeacoffee.com/mashpie" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" style="height: 51px !important;width: 217px !important; border-radius: 0.5rem !important;" width="217" height="51"></a><br>
...if you like  :)
</p>

## Install
```sh
npm install i18n --save
```

## Synopsis

```js
const http = require('http')
const path = require('path')
const { I18n } = require('i18n')

const i18n = new I18n({
  locales: ['en', 'de'],
  directory: path.join(__dirname, 'locales')
})

const app = http.createServer((req, res) => {
  i18n.init(req, res)
  res.end(res.__('Hello'))
})

app.listen(3000, '127.0.0.1')
```
This wires up a plain http server and return "Hello" or "Hallo" depending on browsers 'Accept-Language'. The first configured locale 'en' will default in case the browser doesn't include any of those locales in his request.

---

## Usage

With __0.12.0__ `i18n` now provides options to be used as instance or singleton.

- __Instances__ allow to work with multiple different configurations and encapsulate resources and states.
- __Singletons__ allow to share configuration, state and resources across multiple requires, modules or files.

Before __0.12.0__ _singleton usage_ was the only option. Instances give much more intuitive control and should be considered the "better practice" in complex setups.

### As Instance

Minimal example, just setup two locales and a project specific directory.

```js
/**
 * require I18n with capital I as constructor
 */
const { I18n } = require('i18n')

/**
 * create a new instance with it's configuration
 */
const i18n = new I18n({
  locales: ['en', 'de'],
  directory: path.join(__dirname, 'locales')
})
```

Alternatively split creation and configuration, useful when split up into different modules for bootstrapping.

```js
/**
 * require I18n with capital I as constructor
 */
const { I18n } = require('i18n')

/**
 * create a new instance
 */
const i18n = new I18n()

/**
 * later in code configure
 */
i18n.configure({
  locales: ['en', 'de'],
  directory: path.join(__dirname, '/locales')
})
```


### As Singleton

Same Minimal example, just setup two locales and a project specific directory.

```js
const i18n = require('i18n')

/**
 * configure shared state
 */
i18n.configure({
  locales: ['en', 'de'],
  directory: path.join(__dirname, '/locales')
})
```

Now you are ready to use a global `i18n.__('Hello')`.

Require `i18n`in another file reuses same configuration and shares state:

```js
const i18n = require('i18n')

module.exports = () => {
  console.log(i18n.__('Hello'))
}
```

### CLI within global scope

In your cli, when not registered to a specific object:

```js
var greeting = i18n.__('Hello')
```


> **Global** assumes you share a common state of localization in any time and any part of your app. This is usually fine in cli-style scripts. When serving responses to http requests you'll need to make sure that scope is __NOT__ shared globally but attached to your request object.

### Middleware in express.js

In an express app, you might use i18n.init to gather language settings of your visitors and also bind your helpers to response object honoring request objects locale, ie:

```js
// Configuration
app.configure(function () {
  // [...]

  // default: using 'accept-language' header to guess language settings
  app.use(i18n.init)

  // [...]
})
```

in your apps methods:

```js
app.get('/de', function (req, res) {
  var greeting = res.__('Hello')
})
```


in your templates (depending on your template engine)

```ejs
<%= __('Hello') %>

${__('Hello')}
```

### Some examples for common setups

See [tested examples](https://github.com/mashpie/i18n-node/tree/master/examples) inside `/examples` for some inspiration in node and express or browse these gists:

> PLEASE NOTE: Those gist examples worked until node 0.12.x only

* [plain Node.js + HTTP](https://gist.github.com/mashpie/5188567)
* [plain Node.js + restify](https://gist.github.com/mashpie/5694251)
* [Express 3 + cookie](https://gist.github.com/mashpie/5124626)
* [Express 3 + hbs 2 (+ cookie)](https://gist.github.com/mashpie/5246334)
* [Express 3 + Mustache (+ cookie)](https://gist.github.com/mashpie/5247373)
* [Express 4 + cookie](https://gist.github.com/mashpie/08e5a0ee764f7b6b1355)

For serving the same static files with different language url, you could:

```js
app.use(express.static(__dirname + '/www'))
app.use('/en', express.static(__dirname + '/www'))
app.use('/de', express.static(__dirname + '/www'))
```
---

## API

The api is subject of incremental development. That means, it should not change nor remove any aspect of the current api but new features and options will get added that don't break compatibility backwards within a major version.

### i18n.configure()

You should configure your application once to bootstrap all aspects of `i18n`. You should not configure i18n in each loop when used in an http based scenario. During configuration, `i18n` reads all known locales into memory and prepares to keep that superfast object in sync with your files in filesystem  as configured

```js
i18n.configure({
  locales: ['en', 'de'],
  directory: path.join(__dirname, 'locales')
})
```

**Since 0.7.0** you may even omit the `locales` setting and just configure a `directory`. `i18n` will read all files within that directory and detect all given locales by their filenames.

```js
i18n.configure({
  directory: path.join(__dirname, 'locales')
});
```

#### list of all configuration options
```js
i18n.configure({
  // setup some locales - other locales default to en silently
  locales: ['en', 'de'],

  // fallback from Dutch to German and from any localized German (de-at, de-li etc.) to German
  fallbacks: { nl: 'de', 'de-*': 'de' },

  // you may alter a site wide default locale
  defaultLocale: 'en',

  // will return translation from defaultLocale in case current locale doesn't provide it
  retryInDefaultLocale: false,

  // sets a custom cookie name to parse locale settings from - defaults to NULL
  cookie: 'yourcookiename',

  // sets a custom header name to read the language preference from - accept-language header by default
  header: 'accept-language',

  // query parameter to switch locale (ie. /home?lang=ch) - defaults to NULL
  queryParameter: 'lang',

  // where to store json files - defaults to './locales' relative to modules directory
  directory: './mylocales',

  // control mode on directory creation - defaults to NULL which defaults to umask of process user. Setting has no effect on win.
  directoryPermissions: '755',

  // watch for changes in JSON files to reload locale on updates - defaults to false
  autoReload: true,

  // whether to write new locale information to disk - defaults to true
  updateFiles: false,

  // sync locale information across all files - defaults to false
  syncFiles: false,

  // what to use as the indentation unit - defaults to "\t"
  indent: '\t',

  // setting extension of json files - defaults to '.json' (you might want to set this to '.js' according to webtranslateit)
  extension: '.json',

  // setting prefix of json files name - default to none '' (in case you use different locale files naming scheme (webapp-en.json), rather then just en.json)
  prefix: 'webapp-',

  // enable object notation
  objectNotation: false,

  // setting of log level DEBUG - default to require('debug')('i18n:debug')
  logDebugFn: function (msg) {
    console.log('debug', msg)
  },

  // setting of log level WARN - default to require('debug')('i18n:warn')
  logWarnFn: function (msg) {
    console.log('warn', msg)
  },

  // setting of log level ERROR - default to require('debug')('i18n:error')
  logErrorFn: function (msg) {
    console.log('error', msg)
  },

  // used to alter the behaviour of missing keys
  missingKeyFn: function (locale, value) {
    return value
  },

  // object or [obj1, obj2] to bind the i18n api and current locale to - defaults to null
  register: global,

  // hash to specify different aliases for i18n's internal methods to apply on the request/response objects (method -> alias).
  // note that this will *not* overwrite existing properties with the same name
  api: {
    __: 't', // now req.__ becomes req.t
    __n: 'tn' // and req.__n can be called as req.tn
  },

  // When set to true, downcase locale when passed on queryParam; e.g. lang=en-US becomes en-us.
  // When set to false, the queryParam value will be used as passed;
  // e.g. lang=en-US remains en-US.
  preserveLegacyCase: true, // defaults to true

  // set the language catalog statically
  // also overrides locales
  staticCatalog: {
    de: {
      /* require('de.json') */
    }
  },

  // use mustache with customTags (https://www.npmjs.com/package/mustache#custom-delimiters) or disable mustache entirely
  mustacheConfig: {
    tags: ['{{', '}}'],
    disable: false
  }
})

```

The locale itself is gathered directly from the browser by header, cookie or query parameter depending on your setup.

In case of cookie you will also need to enable cookies for your application. For express this done by adding `app.use(express.cookieParser())`). Now use the same cookie name when setting it in the user preferred language, like here:

```js
res.cookie('yourcookiename', 'de', { maxAge: 900000, httpOnly: true })
```

After this and until the cookie expires, `i18n.init()` will get the value of the cookie to set that language instead of default for every page.

#### Some words on `register` option

Used especially in a CLI-like script. You won't use any `i18n.init()` to guess language settings from your user, thus `i18n` won't bind itself to any `res` or `req` object and will work like a static module.

```js
var anyObject = {}

i18n.configure({
  locales: ['en', 'de'],
  register: anyObject
})

anyObject.setLocale('de')
anyObject.__('Hallo') // --> Hallo
```

Cli usage is a special use case, as we won't need to maintain any transaction / concurrency aware setting of locale, so you could even choose to bind `i18n` to _global_ scope of node:

```js
i18n.configure({
  locales: ['en', 'de'],
  register: global
})

i18n.setLocale('de')
__('Hello') // --> Hallo
```

#### Some words on `staticCatalog` option

Instead of letting i18n load translations from a given directory you may pass translations as static js object right on configuration. This supports any method that returns a `key:value` translation object (`{ Hello: 'Hallo', Cat: 'Katze' }`). So you might even mix native **json** with **js** modules and parsed **yaml** files, like so:

```js
// DEMO: quickly add yaml support
const yaml = require('js-yaml')
const fs = require('fs')

// configure and load translations from different locations
i18n.configure({
  staticCatalog: {
    de: require('../../locales/de-as-json.json'),
    en: require('../../locales/en-as-module.js'),
    fr: yaml.safeLoad(fs.readFileSync('../../locales/fr-as-yaml.yml', 'utf8'))
  },
  defaultLocale: 'de'
})
```

**NOTE:** Enabling `staticCatalog` disables all other fs realated options such as `updateFiles`,  `autoReload` and `syncFiles`

### i18n.init()

When used as middleware in frameworks like express to setup the current environment for each loop. In contrast to configure the `i18n.init()` should be called within each request-response-cycle.

```js
var app = express()
app.use(cookieParser())
app.use(i18n.init)
```

When i18n is used like this, the `i18n.init()` tries to

1. guess the language of a visitor by it's browser settings, cookie or query parameter
2. set that language in any of the "usual" objects provided by the framework

Express would call `i18n.init(req, res, next)`, which is "classic" and adopted by many frameworks. Thus `i18n` will attach it's api to that schema:

```js
{
  req: {
    locals: {},
    res: {
      locals: {},
    }
  }
}
```

and add it's extra attributes and methods, like so:

```js
{
  req: {
    locals: {
      locale: "de",
      __: [function],
      __n: [function],
      [...]
    },
    res: {
      locals: {
        locale: "de",
        __: [function],
        __n: [function],
        [...]
      },
      locale: "de",
      __: [function],
      __n: [function],
      [...]
    },
    locale: "de",
    __: [function],
    __n: [function],
    [...]
  }
}
```

Now each _local_ object (ie. res.locals) is setup with _it's own "private"_ locale and methods to get the appropriate translation from the _global_ catalog.

### i18n.__()

Translates a single phrase and adds it to locales if unknown. Returns translated parsed and substituted string.

```js
// template and global (this.locale == 'de')
__('Hello') // Hallo
__('Hello %s', 'Marcus') // Hallo Marcus
__('Hello {{name}}', { name: 'Marcus' }) // Hallo Marcus

// scoped via req object (req.locale == 'de')
req.__('Hello') // Hallo
req.__('Hello %s', 'Marcus') // Hallo Marcus
req.__('Hello {{name}}', { name: 'Marcus' }) // Hallo Marcus

// scoped via res object (res.locale == 'de')
res.__('Hello') // Hallo
res.__('Hello %s', 'Marcus') // Hallo Marcus
res.__('Hello {{name}}', { name: 'Marcus' }) // Hallo Marcus

// passing specific locale
__({ phrase: 'Hello', locale: 'fr' }) // Salut
__({ phrase: 'Hello %s', locale: 'fr' }, 'Marcus') // Salut Marcus
__({ phrase: 'Hello {{name}}', locale: 'fr' }, { name: 'Marcus' }) // Salut Marcus
```

### i18n.__n()

Plurals translation of a single phrase. Singular and plural forms will get added to locales if unknown. Returns translated parsed and substituted string based on last `count` parameter.

```js
// short syntax is best suited for reading
// --> writes '%s cat' to both `one` and `other` plurals
__n('%s cat', 1) // --> 1 Katze
__n('%s cat', 3) // --> 3 Katzen

// long syntax works fine in combination with `updateFiles`
// --> writes '%s cat' to `one` and '%s cats' to `other` plurals
// "one" (singular) & "other" (plural) just covers the basic Germanic Rule#1 correctly.
__n('%s cat', '%s cats', 1) // 1 Katze
__n('%s cat', '%s cats', 3) // 3 Katzen

// scoped via req object (req.locale == 'de')
req.__n('%s cat', 1) // 1 Katze
req.__n('%s cat', 3) // 3 Katzen

// scoped via res object (res.locale == 'de')
res.__n('%s cat', 1) // 1 Katze
res.__n('%s cat', 3) // 3 Katzen

// passing specific locale
__n({ singular: '%s cat', plural: '%s cats', locale: 'fr' }, 1) // 1 chat
__n({ singular: '%s cat', plural: '%s cats', locale: 'fr' }, 3) // 3 chats

// the all in one object signature
__n({ singular: '%s cat', plural: '%s cats', locale: 'fr', count: 1 }) // 1 chat
__n({ singular: '%s cat', plural: '%s cats', locale: 'fr', count: 3 }) // 3 chats
```

When used in short form like `__n(phrase, count)` the following will get added to your json files:

```js
__n('%s dog', 1)
```

```json
{
  "%s dog": {
    "one": "%s dog",
    "other": "%s dog"
  }
}
```

When used in long form like `__n(singular, plural, count)` you benefit form passing defaults to both forms:

```js
__n('%s kitty', '%s kittens', 0)
```

```json
{
  "%s kitty": {
    "one": "%s kitty",
    "other": "%s kittens"
  }
}
```

You might now add extra forms to certain json files to support the complete set of plural forms, like for example in russian:

```json
{
  "%s cat": {
    "one": "%d кошка",
    "few": "%d кошки",
    "many": "%d кошек",
    "other": "%d кошка",
  }
}
```

and let `__n()` select the correct form for you:

```js
__n('%s cat', 0) // --> 0 кошек
__n('%s cat', 1) // --> 1 кошка
__n('%s cat', 2) // --> 2 кошки
__n('%s cat', 5) // --> 5 кошек
__n('%s cat', 6) // --> 6 кошек
__n('%s cat', 21) // --> 21 кошка
```

> __Note__ i18n.__n() will add a blueprint ("one, other" or "one, few, other" for example) for each locale to your json on updateFiles in a future version.

### i18n.__mf()

Supports the advanced MessageFormat as provided by excellent [messageformat module](https://www.npmjs.com/package/messageformat). You should definetly head over to [messageformat.github.io](https://messageformat.github.io) for a guide to MessageFormat. i18n takes care of `new MessageFormat('en').compile(msg);` with the current `msg` loaded from it's json files and cache that complied fn in memory. So in short you might use it similar to `__()` plus extra object to accomplish MessageFormat's formatting. Ok, some examples:

```js
// assume res is set to german
res.setLocale('de')

// start simple
res.__mf('Hello') // --> Hallo

// can replace too
res.__mf('Hello {name}', { name: 'Marcus' }) // --> Hallo Marcus

// and combines with sprintf
res.__mf('Hello {name}, how was your %s?', 'test', { name: 'Marcus' }) // --> Hallo Marcus, wie war dein test?

// now check out a plural rule
res.__mf('{N, plural, one{# cat} few{# cats} many{# cats} others{# cats}}', {
  N: 1
})

// results for "1" in   (all use "one")
// en --> 1 cat
// de --> 1 Katze
// fr --> 1 chat
// ru --> 1 кошка       ru uses "__one__" when ending on "1"

// results for "0" in   (most use "others")
// en --> 0 cats
// de --> 0 Katzen
// fr --> 0 chat        fr uses "__one__" for zero
// ru --> 0 кошек       ru uses "__many__"

// results for "2" in   (most use "others")
// en --> 2 cat
// de --> 2 Katze
// fr --> 2 chat
// ru --> 2 кошки       ru uses "__few__" when ending on "1"

// results for "5" in   (most use "others")
// en --> 5 cat
// de --> 5 Katze
// fr --> 5 chat
// ru --> 5 кошек       ru uses "__many__"

// results for "21" in  (most use "others")
// en --> 21 cat
// de --> 21 Katze
// fr --> 21 chat
// ru --> 21 кошка       ru uses "__one__" when ending on "1"
```

Take a look at [Mozilla](https://developer.mozilla.org/en-US/docs/Mozilla/Localization/Localization_and_Plurals) to quickly get an idea of what pluralization has to deal with. With `__mf()` you get a very powerful tool, but you need to handle it correctly.

But MessageFormat can handle more! You get ability to process:

* Simple Variable Replacement (similar to mustache placeholders)
* SelectFormat (ie. switch msg based on gender)
* PluralFormat (see above and [ranges](#ranged-interval-support))

Combinations of those give superpower, but should get tested well (contribute your use case, please!) on integration.

### i18n.__l()

Returns a list of translations for a given phrase in each language.

```js
i18n.__l('Hello') // --> [ 'Hallo', 'Hello' ]
```

This will be usefull when setting up localized routes for example (kudos to @xpepermint, #150):

```js
// this will match routes
// EN --> /:locale/products/:id?
// ES --> /:locale/productos/:id?
app.get(__l('/:locale/products/:id?'), function (req, res) {
  // guess what you might use req.params.locale for?
})
```

> i18n.__ln() to get plurals will come up in another release...

### i18n.__h()

Returns a hashed list of translations for a given phrase in each language.

```js
i18n.__h('Hello') // --> [ { de: 'Hallo' }, { en: 'Hello' } ]
```

> i18n.__hn() to get plurals will come up in another release...

### i18n.setLocale()

Setting the current locale (ie.: `en`) globally or in current scope.

```js
setLocale('de')
setLocale(req, 'de')
req.setLocale('de')
```

Use setLocale to change any initial locale that was set in `i18n.init()`. You get more control on how when and which objects get setup with a given locale. Locale values are inherited within the given schema like in `i18n.init()` Let's see some examples:

```js
i18n.setLocale(req, 'ar') // --> req: مرحبا res: مرحبا res.locals: مرحبا
i18n.setLocale(res, 'ar') // --> req: Hallo res: مرحبا res.locals: مرحبا
i18n.setLocale(res.locals, 'ar') // --> req: Hallo res: Hallo res.locals: مرحبا
```

You'll get even more control when passing an array of objects:

```js
i18n.setLocale([req, res.locals], req.params.lang) // --> req: مرحبا res: Hallo res.locals: مرحبا
```

or disable inheritance by passing true as third parameter:

```js
i18n.setLocale(res, 'ar', true) // --> req: Hallo res: مرحبا res.locals: Hallo
```

### i18n.getLocale()

Getting the current locale (ie.: `en`) from current scope or globally.

```js
getLocale() // --> de
getLocale(req) // --> de
req.getLocale() // --> de
```

### i18n.getLocales()

Returns a list with all configured locales.

```js
i18n.getLocales() // --> ['en', 'de', 'en-GB']
```

### i18n.getCatalog()

Returns a whole catalog optionally based on current scope and locale.

```js
getCatalog() // returns catalog for all locales
getCatalog('de') // returns just for 'de'

getCatalog(req) // returns catalog for all locales
getCatalog(req, 'de') // returns just for 'de'

req.getCatalog() // returns catalog for all locales
req.getCatalog('de') // returns just for 'de'
```

## Attaching helpers for template engines

In general i18n has to be attached to the response object to let it's public api get accessible in your templates and methods. As of **0.4.0** i18n tries to do so internally via `i18n.init`, as if you were doing it in `app.configure` on your own:

```js
app.use(function (req, res, next) {
  // express helper for natively supported engines
  res.locals.__ = res.__ = function () {
    return i18n.__.apply(req, arguments)
  }

  // [...]

  next()
})
```

Different engines need different implementations, so yours might miss or not work with the current default helpers. This one showing an example for mustache in express:

```js
// register helper as a locals function wrapped as mustache expects
app.use(function (req, res, next) {
  // mustache helper
  res.locals.__ = function () {
    return function (text, render) {
      return i18n.__.apply(req, arguments)
    }
  }

  // [...]

  next()
})
```

You could still setup your own implementation. Please refer to Examples below, post an issue or contribute your setup.

## Output formats

As inspired by gettext there is currently support for sprintf-style expressions. You can also use mustache syntax for named parameters.

### sprintf support

```js
var greeting = __('Hello %s, how are you today?', 'Marcus')
```

this puts *Hello Marcus, how are you today?*. You might add endless arguments and even nest it.

```js
var greeting = __('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend'))
```

which puts *Hello Marcus, how are you today? How was your weekend.*

You might need to have repeated references to the same argument, which can be done with sprintf.

```js
var example = __('%1$s, %1$s, %1$s', 'repeat')
```

which puts

```
repeat, repeat, repeat
```

In some cases the argument order will need to be switched for different locales.  The arguments can be strings, floats, numbers, etc.

```js
var example = __('%2$d then %1$s then %3$.2f', 'First', 2, 333.333)
```

which puts

```
2 then First then 333.33
```

### mustache support

You may also use [mustache](http://mustache.github.io/) syntax for your message strings. To pass named parameters to your message, just provide an object as the last parameter. You can still pass unnamed parameters by adding additional arguments.


```js
var greeting = __('Hello {{name}}, how are you today?', { name: 'Marcus' })
```

this puts *Hello Marcus, how are you today?*. You might also combine it with sprintf arguments...

```js
var greeting = __('Hello {{name}}, how was your %s.', __('weekend'), { name: 'Marcus' })
```

and even nest it...

```js
var greeting = __( __('Hello {{name}}, how was your %s?', { name: 'Marcus' }), __('weekend') )
```

which both put *Hello Marcus, how was your weekend.*

#### how about markup?

Including markup in translation and/or variables is considered to be bad practice, as it leads to side effects (translators need to understand it, might break it, inject malformed markup or worse). But well, mustache supports unescaped markup out-of-the-box (*Quote from https://mustache.github.io/mustache.5.html*):

> All variables are HTML escaped by default. If you want to return unescaped HTML, use the triple mustache: {{{name}}}.

So this will work

```js
var greeting = __('Hello {{{name}}}, how are you today?', { name: '<u>Marcus</u>' })
```

as expected:

```html
Hello <u>Marcus</u>, how are you today
```

### basic plural support

two different plural forms are supported as response to `count`:

```js
var singular = __n('%s cat', '%s cats', 1)
var plural = __n('%s cat', '%s cats', 3)
```

this puts **1 cat** or **3 cats**
and again these could get nested:

```js
var singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, 'tree')
var plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, 'tree')
```
putting *There is one monkey in the tree* or *There are 3 monkeys in the tree*. Passing all 3 parameters would write a `one` and `other` to your json. For reading you might just use 2 parameters, too:

```js
__n('%s cat', 1) // --> 1 Katze
__n('%s cat', 3) // --> 3 Katzen
```

### ranged interval support

use mathematical intervals to declare any own plural rules based on [ISO 31-11](https://en.wikipedia.org/wiki/Interval_(mathematics)#Notations_for_intervals) notation. Let's assume the following json snippet:

```json
"dogs": {
    "one": "one dog",
    "other": "[0] no dog|[2,5] some dogs|[6,11] many dogs|[12,36] dozens of dogs|a horde of %s dogs|[100,] too many dogs"
}
```

this will result in

```js
__n('dogs', 0) // --> no dog
__n('dogs', 1) // --> one dog
__n('dogs', 2) // --> some dogs
__n('dogs', 10) // --> many dogs
__n('dogs', 25) // --> dozens of dogs
__n('dogs', 42) // --> a horde of 42 dogs
__n('dogs', 199) // --> too many dogs
```

The rules are parsed in sequenced order, so the first match will skip any extra rules. Example:

```json
{
    "dogs":"[0]no dog|[1]one dog|[,10[ less than ten dogs|[,20[ less than 20 dogs|too many dogs"
}
```

results in

```js
// interval matched by number
__n('dogs', 0) // --> no dog
__n('dogs', 1) // --> one dog
__n('dogs', 2) // --> less than ten dogs
__n('dogs', 9) // --> less than ten dogs
__n('dogs', 10) // --> less than 20 dogs
__n('dogs', 19) // --> less than 20 dogs
__n('dogs', 20) // --> too many dogs
__n('dogs', 199) // --> too many dogs

// no interval returned, but found a catchall
__('dogs') // --> too many dogs
```

See [en.json example](https://github.com/mashpie/i18n-node/blob/master/locales/en.json) inside `/locales` for some inspiration on use cases. Each phrase might get decorated further with mustache and sprintf expressions:

```json
{
    "example":"[0] %s is zero rule for {{me}}|[2,5] %s is between two and five for {{me}}|and a catchall rule for {{me}} to get my number %s"
}
```

will put (as taken from tests):

```js
// will always use a found catchall
__('example', {me: 'marcus'}) // --> and a catchall rule for marcus to get my number %s
__('example', ['one'], {me: 'marcus'}) // --> and a catchall rule for marcus to get my number one

// will search a matching interval or fallback to catchall
__n('example', 1, {me: 'marcus'}) // --> and a catchall rule for marcus to get my number 1
__n('example', 2, {me: 'marcus'}) // --> 2 is between two and five for marcus
__n('example', 5, {me: 'marcus'}) // --> 5 is between two and five for marcus
__n('example', 3, {me: 'marcus'}) // --> 3 is between two and five for marcus
__n('example', 6, {me: 'marcus'}) // --> and a catchall rule for marcus to get my number 6
```
> __Notice__: the "example" object in your json doesn't use any "one", "other" subnodes although you _could_ use and even combine them. Currently "one" referres to the value of exactly 1 while "other" referres to every other value (think of 0, -10, null, false)


### variable support

you might even use dynamic variables as they get interpreted on the fly. Better make sure no user input finds it's way to that point as they all get added to the `en.js` file if not yet existing.

```js
var greetings = ['Hi', 'Hello', 'Howdy']
for (var i = 0; i < greetings.length; i++) {
  console.log(__(greetings[i]))
}
```

which puts

```
Hi
Hello
Howdy
```

## Object notation

In addition to the traditional, linear translation lists, i18n also supports hierarchical translation catalogs.

To enable this feature, be sure to set `objectNotation` to `true` in your `configure()` call. **Note**: If you can't or don't want to use `.` as a delimiter, set `objectNotation` to any other delimiter you like.

Instead of calling `__("Hello")` you might call `__("greeting.formal")` to retrieve a formal greeting from a translation document like this one:

```json
{
  "greeting": {
    "formal": "Hello",
    "informal": "Hi",
    "placeholder": {
      "formal": "Hello %s",
      "informal": "Hi %s"
    }
  }
}
```

In the document, the translation terms, which include placeholders, are nested inside the "greeting" translation. They can be accessed and used in the same way, like so `__('greeting.placeholder.informal', 'Marcus')`.

### Pluralization

Object notation also supports pluralization. When making use of it, the "one" and "other" entries are used implicitly for an object in the translation document. For example, consider the following document:

```json
{
  "pets": {
    "cat": {
      "one": "Katze",
      "other": "Katzen"
    }
  }
}
```

When accessing these, you would use `__n("pets.cat", "pets.cat", 3)` to tell i18n to use both the singular and plural form of the "cat" entry. Naturally, you could also access these members explicitly with `__("pets.cat.one")` and `__("pets.cat.other")`.

### Defaults

When starting a project from scratch, your translation documents will probably be empty. i18n takes care of filling your translation documents for you. Whenever you use an unknown object, it is added to the translation documents.

By default, when using object notation, the provided string literal will be inserted and returned as the default string. As an example, this is what the "greeting" object shown earlier would look like by default:

```json
{
  "greeting": {
    "formal": "greeting.formal",
    "informal": "greeting.informal"
  }
}
```

In case you would prefer to have a default string automatically inserted and returned, you can provide that default string by appending it to your object literal, delimited by a `:`. For example:

```js
__('greeting.formal:Hello')
__('greeting.placeholder.informal:Hi %s')
```

## Storage

> Will get modular support for different storage engines, currently just json files are stored in filesystem.

### json file

the above will automatically generate a `en.json` by default inside `./locales/` which looks like

```json
{
  "Hello": "Hello",
  "Hello %s, how are you today?": "Hello %s, how are you today?",
  "weekend": "weekend",
  "Hello %s, how are you today? How was your %s.": "Hello %s, how are you today? How was your %s.",
  "Hi": "Hi",
  "Howdy": "Howdy",
  "%s cat": {
    "one": "%s cat",
    "other": "%s cats"
  },
  "There is one monkey in the %%s": {
    "one": "There is one monkey in the %%s",
    "other": "There are %d monkeys in the %%s"
  },
  "tree": "tree",
  "%s dog": {
    "one": "one dog",
    "other": "[0] no dog|[2,5] some dogs|[6,11] many dogs|[12,36] dozens of dogs|a horde of %s dogs"
  }
}
```

that file can be edited or just uploaded to [webtranslateit](http://docs.webtranslateit.com/file_formats/) for any kind of collaborative translation workflow:

```json
{
  "Hello": "Hallo",
  "Hello %s, how are you today?": "Hallo %s, wie geht es dir heute?",
  "weekend": "Wochenende",
  "Hello %s, how are you today? How was your %s.": "Hallo %s, wie geht es dir heute? Wie war dein %s.",
  "Hi": "Hi",
  "Howdy": "Hallöchen",
  "%s cat": {
    "one": "%s Katze",
    "other": "%s Katzen"
  },
  "There is one monkey in the %%s": {
    "one": "Im %%s sitzt ein Affe",
    "other": "Im %%s sitzen %d Affen"
  },
  "tree": "Baum",
  "%s dog": {
    "one": "Ein Hund",
    "other": "[0] Kein Hund|[2,5] Ein paar Hunde|[6,11] Viele Hunde|[12,36] Dutzende Hunde|Ein Rudel von %s Hunden"
  }
}
```

## Logging & Debugging

Logging any kind of output is moved to [debug](https://github.com/visionmedia/debug) module. To let i18n output anything run your app with `DEBUG` env set like so:

```sh
$ DEBUG=i18n:* node app.js
```

i18n exposes three log-levels:

* i18n:debug
* i18n:warn
* i18n:error

if you only want to get errors and warnings reported start your node server like so:

```sh
$ DEBUG=i18n:warn,i18n:error node app.js
```

Combine those settings with you existing application if any of you other modules or libs also uses __debug__

### Using custom logger

You can configure i18n to use a custom logger. For example attach some simple `console`-logging:

```js
i18n.configure({
  // setting of log level DEBUG - default to require('debug')('i18n:debug')
  logDebugFn: function (msg) {
    console.log('debug', msg)
  },

  // setting of log level WARN - default to require('debug')('i18n:warn')
  logWarnFn: function (msg) {
    console.log('warn', msg)
  },

  // setting of log level ERROR - default to require('debug')('i18n:error')
  logErrorFn: function (msg) {
    console.log('error', msg)
  }
})
```

## Test
```sh
npm test
```

## Roadmap

* add a storage adapter (to support .yaml, .js, memory)
* improved fallbacks
* refactor dot notation (ie. configurable delimiters)
* refactor to ES6
* refactor to standard + prettier
* move docs + examples to github pages

## Changelog

For current release notes see [GitHub Release Notes](https://github.com/mashpie/i18n-node/releases). Changes until 0.8.3 are filed as [Changelog Summary](https://github.com/mashpie/i18n-node/blob/master/CHANGELOG.md).

[npm-image]: https://badge.fury.io/js/i18n.svg
[npm-url]: https://www.npmjs.com/package/i18n

[coveralls-image]: https://coveralls.io/repos/github/mashpie/i18n-node/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/mashpie/i18n-node?branch=master

[snyk-image]: https://snyk.io/test/npm/i18n/badge.svg
[snyk-url]: https://snyk.io/test/npm/i18n

[fossa-image]: https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmashpie%2Fi18n-node.svg?type=shield
[fossa-url]: https://app.fossa.com/projects/git%2Bgithub.com%2Fmashpie%2Fi18n-node?ref=badge_shield
