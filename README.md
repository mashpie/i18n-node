# i18n

Lightweight simple translation module with dynamic json storage. Supports plain vanilla node.js apps and should work with any framework (like _express_, _restify_ and probably more) that exposes an `app.use()` method passing in `res` and `req` objects.
Uses common __('...') syntax in app and templates.
Stores language files in json files compatible to [webtranslateit](http://webtranslateit.com/) json format.
Adds new strings on-the-fly when first used in your app.
No extra parsing needed.

[![Linux/OSX Build][travis-image]][travis-url]
[![Windows Build][appveyor-image]][appveyor-url]
[![NPM version][npm-image]][npm-url]
[![Dependency Status][dependency-image]][dependency-url]
[![Test Coverage][coveralls-image]][coveralls-url]


## Install
```sh
npm install i18n --save
```

## Test
```sh
npm test
```

## Load
```js
// load modules
var express = require('express'),
    i18n = require("i18n");
```

## Configure

Minimal example, just setup two locales and a project specific directory

```js
i18n.configure({
    locales:['en', 'de'],
    directory: __dirname + '/locales'
});
```
now you are ready to use a global `i18n.__('Hello')`.

## Example usage in global scope

In your cli, when not registered to a specific object:

```js
var greeting = i18n.__('Hello');
```

> **Global** assumes you share a common state of localization in any time and any part of your app. This is usually fine in cli-style scripts. When serving responses to http requests you'll need to make sure that scope is __NOT__ shared globally but attached to your request object.

## Example usage in express.js

In an express app, you might use i18n.init to gather language settings of your visitors and also bind your helpers to response object honoring request objects locale, ie:

```js
// Configuration
app.configure(function() {

    [...]

    // default: using 'accept-language' header to guess language settings
    app.use(i18n.init);

    [...]
});
```

in your apps methods:

```js
app.get('/de', function(req, res){
  var greeting = res.__('Hello');
});
```


in your templates (depending on your template engine)

```ejs
<%= __('Hello') %>

${__('Hello')}
```

## Examples for common setups

See [tested examples](https://github.com/mashpie/i18n-node/tree/master/examples) inside `/examples` for some inspiration in node 4.x / 5.x or browse these gists:

> PLEASE NOTE: Those gist examples worked until node 0.12.x only

* [plain node.js + http](https://gist.github.com/mashpie/5188567)
* [plain node.js + restify](https://gist.github.com/mashpie/5694251)
* [express 3 + cookie](https://gist.github.com/mashpie/5124626)
* [express 3 + hbs 2 (+ cookie)](https://gist.github.com/mashpie/5246334)
* [express 3 + mustache (+ cookie)](https://gist.github.com/mashpie/5247373)
* [express 4 + cookie](https://gist.github.com/mashpie/08e5a0ee764f7b6b1355)

For serving the same static files with different language url, you could:

```js
app.use(express.static(__dirname + '/www'));
app.use('/en', express.static(__dirname + '/www'));
app.use('/de', express.static(__dirname + '/www'));
```

## API

The api is subject of incremental development. That means, it should not change nor remove any aspect of the current api but new features and options will get added that don't break compatibility backwards within a major version.

### i18n.configure()

You should configure your application once to bootstrap all aspects of `i18n`. You should not configure i18n in each loop when used in an http based scenario. During configuration, `i18n` reads all known locales into memory and prepares to keep that superfast object in sync with your files in filesystem  as configured

```js
i18n.configure({
    locales:['en', 'de'],
    directory: __dirname + '/locales'
});
```

#### list of all configuration options
```js
i18n.configure({
    // setup some locales - other locales default to en silently
    locales:['en', 'de'],

    // fall back from Dutch to German
    fallbacks:{'nl': 'de'},

    // you may alter a site wide default locale
    defaultLocale: 'de',

    // sets a custom cookie name to parse locale settings from - defaults to NULL
    cookie: 'yourcookiename',

    // where to store json files - defaults to './locales' relative to modules directory
    directory: './mylocales',

    // controll mode on directory creation - defaults to NULL which defaults to umask of process user. Setting has no effect on win.
    directoryPermissions: '755',

    // watch for changes in json files to reload locale on updates - defaults to false
    autoReload: true,

    // whether to write new locale information to disk - defaults to true
    updateFiles: false,

    // what to use as the indentation unit - defaults to "\t"
    indent: "\t",

    // setting extension of json files - defaults to '.json' (you might want to set this to '.js' according to webtranslateit)
    extension: '.js',

    // setting prefix of json files name - default to none '' (in case you use different locale files naming scheme (webapp-en.json), rather then just en.json)
    prefix: 'webapp-',

    // enable object notation
    objectNotation: false,

    // setting of log level DEBUG - default to require('debug')('i18n:debug')
    logDebugFn: function (msg) {
        console.log('debug', msg);
    },

    // setting of log level WARN - default to require('debug')('i18n:warn')
    logWarnFn: function (msg) {
        console.log('warn', msg);
    },

    // setting of log level ERROR - default to require('debug')('i18n:error')
    logErrorFn: function (msg) {
        console.log('error', msg);
    }
});
```

The locale itself is gathered directly from the browser by header, cookie or query parameter depending on your setup.

In case of cookie you will also need to enable cookies for your application. For express this done by adding `app.use(express.cookieParser())`). Now use the same cookie name when setting it in the user preferred language, like here:

```js
res.cookie('yourcookiename', 'de', { maxAge: 900000, httpOnly: true });
```

After this and until the cookie expires, `i18n.init()` will get the value of the cookie to set that language instead of default for every page.

### i18n.init()

When used as middleware in frameworks like express to setup the current environment for each loop. In contrast to configure the `i18n.init()` should be called within each request-response-cycle.

```js
var app = express();
app.use(cookieParser());
app.use(i18n.init);
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
__('Hello'); // Hallo
__('Hello %s', 'Marcus'); // Hallo Marcus
__('Hello {{name}}', { name: 'Marcus' }); // Hallo Marcus


// scoped via req object (req.locale == 'de')
req.__('Hello'); // Hallo
req.__('Hello %s', 'Marcus'); // Hallo Marcus
req.__('Hello {{name}}', { name: 'Marcus' }); // Hallo Marcus

// scoped via res object (res.locale == 'de')
res.__('Hello'); // Hallo
res.__('Hello %s', 'Marcus'); // Hallo Marcus
res.__('Hello {{name}}', { name: 'Marcus' }); // Hallo Marcus

// passing specific locale
__({phrase: 'Hello', locale: 'fr'}); // Salut
__({phrase: 'Hello %s', locale: 'fr'}, 'Marcus'); // Salut Marcus
__({phrase: 'Hello {{name}}', locale: 'fr'}, { name: 'Marcus' }); // Salut Marcus
```

### i18n.__n()

Plurals translation of a single phrase. Singular and plural forms will get added to locales if unknown. Returns translated parsed and substituted string based on `count` parameter.

```js
// template and global (this.locale == 'de')
__n("%s cat", "%s cats", 1); // 1 Katze
__n("%s cat", "%s cats", 3); // 3 Katzen

// scoped via req object (req.locale == 'de')
req.__n("%s cat", "%s cats", 1); // 1 Katze
req.__n("%s cat", "%s cats", 3); // 3 Katzen

// scoped via res object (res.locale == 'de')
res.__n("%s cat", "%s cats", 1); // 1 Katze
res.__n("%s cat", "%s cats", 3); // 3 Katzen

// passing specific locale
__n({singular: "%s cat", plural: "%s cats", locale: "fr"}, 1); // 1 chat
__n({singular: "%s cat", plural: "%s cats", locale: "fr"}, 3); // 3 chat

__n({singular: "%s cat", plural: "%s cats", locale: "fr", count: 1}); // 1 chat
__n({singular: "%s cat", plural: "%s cats", locale: "fr", count: 3}); // 3 chat
```

### i18n.setLocale()

Setting the current locale (ie.: `en`) globally or in current scope.

```js
setLocale('de');
setLocale(req, 'de');
req.setLocale('de');
```

Use setLocale to change any initial locale that was set in `i18n.init()`. You get more control on how when and which objects get setup with a given locale. Locale values are inherited within the given schema like in `i18n.init()` Let's see some examples:

```js
i18n.setLocale(req, 'ar'); // --> req: مرحبا res: Hallo res.locals: Hallo
i18n.setLocale(res, 'ar'); // --> req: Hallo res: مرحبا res.locals: Hallo
i18n.setLocale(res.locals, 'ar'); // --> req: Hallo res: Hallo res.locals: مرحبا
```

You'll get even more controll when passing an array of objects:

```js
i18n.setLocale([req, res.locals], req.params.lang); // --> req: مرحبا res: Hallo res.locals: مرحبا
```

or disable inheritance by passing true as third parameter:

```js
i18n.setLocale(res, 'ar', true); // --> req: Hallo res: مرحبا res.locals: Hallo
```


### i18n.getLocale()

Getting the current locale (ie.: `en`) from current scope or globally.

```js
getLocale(); // --> de
getLocale(req); // --> de
req.getLocale(); // --> de
```

### i18n.getCatalog()

Returns a whole catalog optionally based on current scope and locale.

```js
getCatalog(); // returns all locales
getCatalog('de'); // returns just 'de'

getCatalog(req); // returns current locale of req
getCatalog(req, 'de'); // returns just 'de'

req.getCatalog(); // returns current locale of req
req.getCatalog('de'); // returns just 'de'
```

## Attaching helpers for template engines

In general i18n has to be attached to the response object to let it's public api get accessible in your templates and methods. As of **0.4.0** i18n tries to do so internally via `i18n.init`, as if you were doing it in `app.configure` on your own:

```js
app.use(function(req, res, next) {
    // express helper for natively supported engines
    res.locals.__ = res.__ = function() {
        return i18n.__.apply(req, arguments);
    };

    [...]

    next();
});
```

Different engines need different implementations, so yours might miss or not work with the current default helpers. This one showing an example for mustache in express:

```js
// register helper as a locals function wrapped as mustache expects
app.use(function (req, res, next) {
    // mustache helper
    res.locals.__ = function () {
      return function (text, render) {
        return i18n.__.apply(req, arguments);
      };
    };

    [...]

    next();
});
```

You could still setup your own implementation. Please refer to Examples below, post an issue or contribute your setup.

## Output formats

As inspired by gettext there is currently support for sprintf-style expressions. You can also use mustache syntax for named parameters.

### sprintf support

```js
var greeting = __('Hello %s, how are you today?', 'Marcus');
```

this puts *Hello Marcus, how are you today?*. You might add endless arguments and even nest it.

```js
var greeting = __('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend'));
```

which puts *Hello Marcus, how are you today? How was your weekend.*

You might need to have repeated references to the same argument, which can be done with sprintf.

```js
var example = __('%1$s, %1$s, %1$s', 'repeat');
```

which puts

```
repeat, repeat, repeat
```

In some cases the argument order will need to be switched for different locales.  The arguments can be strings, floats, numbers, etc.

```js
var example = __('%2$d then %1$s then %3$.2f', 'First', 2, 333.333);
```

which puts

```
2 then First then 333.33
```

### mustache support

You may also use [mustache](http://mustache.github.io/) syntax for your message strings. To pass named parameters to your message, just provide an object as the last parameter. You can still pass unnamed parameters by adding additional arguments.

```js
var greeting = __('Hello {{name}}, how are you today?', { name: 'Marcus' });
```

this puts *Hello Marcus, how are you today?*. You might also combine it with sprintf arguments...

```js
var greeting = __('Hello {{name}}, how was your %s.', __('weekend'), { name: 'Marcus' });
```

and even nest it...

```js
var greeting = __( __('Hello {{name}}, how was your %s?', { name: 'Marcus' }), __('weekend') );
```

which both put *Hello Marcus, how was your weekend.*

### variable support

you might even use dynamic variables as they get interpreted on the fly. Better make sure no user input finds it's way to that point as they all get added to the `en.js` file if not yet existing.

```js
var greetings = ['Hi', 'Hello', 'Howdy'];
for (var i=0; i < greetings.length; i++) {
    console.log( __(greetings[i]) );
};
```

which puts

```
Hi
Hello
Howdy
```

### basic plural support

two different plural forms are supported as response to `count`:

```js
var singular = __n('%s cat', '%s cats', 1);
var plural = __n('%s cat', '%s cats', 3);
```

this puts **1 cat** or **3 cats**
and again these could get nested:

```js
var singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, 'tree');
var plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, 'tree');
```

putting *There is one monkey in the tree* or *There are 3 monkeys in the tree*

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
    "tree": "tree"
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
    "tree": "Baum"
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

## Using custom logger

You can configure i18n to use a custom logger. For example attach some simple `console`-logging:

```js
i18n.configure({

    ...

    // setting of log level DEBUG - default to require('debug')('i18n:debug')
    logDebugFn: function (msg) {
        console.log('debug', msg);
    },

    // setting of log level WARN - default to require('debug')('i18n:warn')
    logWarnFn: function (msg) {
        console.log('warn', msg);
    },

    // setting of log level ERROR - default to require('debug')('i18n:error')
    logErrorFn: function (msg) {
        console.log('error', msg);
    }
});
```


## Object notation

In addition to the traditional, linear translation lists, i18n also supports hierarchical translation catalogs.

To enable this feature, be sure to set `objectNotation` to `true` in your `configure()` call. **Note**: If you can't or don't want to use `.` as a delimiter, set `objectNotation` to any other delimiter you like.

Instead of calling `__("Hello")` you might call `__("greeting.formal")` to retrieve a formal greeting from a translation document like this one:

```js
"greeting": {
    "formal": "Hello",
    "informal": "Hi",
    "placeholder": {
        "formal": "Hello %s",
        "informal": "Hi %s"
    }
}
```

In the document, the translation terms, which include placeholders, are nested inside the "greeting" translation. They can be accessed and used in the same way, like so `__('greeting.placeholder.informal', 'Marcus')`.

### Pluralization

Object notation also supports pluralization. When making use of it, the "one" and "other" entries are used implicitly for an object in the translation document. For example, consider the following document:

```js
"cat": {
    "one": "Katze",
    "other": "Katzen"
}
```

When accessing these, you would use `__n("cat", "cat", 3)` to tell i18n to use both the singular and plural form of the "cat" entry. Naturally, you could also access these members explicitly with `__("cat.one")` and `__("cat.other")`.

### Defaults

When starting a project from scratch, your translation documents will probably be empty. i18n takes care of filling your translation documents for you. Whenever you use an unknown object, it is added to the translation documents.

By default, when using object notation, the provided string literal will be inserted and returned as the default string. As an example, this is what the "greeting" object shown earlier would look like by default:

```js
"greeting": {
    "formal": "greeting.formal",
    "informal": "greeting.informal"
}
```

In case you would prefer to have a default string automatically inserted and returned, you can provide that default string by appending it to your object literal, delimited by a `:`. For example:

```js
__("greeting.formal:Hello")
__("greeting.placeholder.informal:Hi %s")
```

[![NPM](https://nodei.co/npm/i18n.svg?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/i18n/)

## Changelog

* 0.6.0: __improved__: Accept-Language header parsing to ICU, delimiters with object notation, jshint, package.json, README; __new__: prefix for locale files, `i18n.getLocales()`, custom logger, fallback[s]; __fixed__: typos, badges, plural (numbers), `i18n.setLocale()` for `req` _and_ `res`
* 0.5.0: feature release; added {{mustache}} parsing by #85, added "object.notation" by #110, fixed buggy req.__() implementation by #111 and closed 13 issues
* 0.4.1: stable release; merged/closed: #57, #60, #67 typo fixes; added more examples and new features: #53, #65, #66 - and some more api reference
* 0.4.0: stable release; closed: #22, #24, #4, #10, #54; added examples, clarified concurrency usage in different template engines, added `i18n.getCatalog`
* 0.3.9: express.js usage, named api, jscoverage + more test, refactored configure, closed: #51, #20, #16, #49
* 0.3.8: fixed: #44, #49; merged: #47, #45, #50; added: #33; updated: README
* 0.3.7: tests by mocha.js, added `this.locale` to `__` and `__n`
* 0.3.6: travisCI, writeFileSync, devDependencies, jslint, MIT, fixed: #29, #9, merged: #25, #30, #43
* 0.3.5: fixed some issues, prepared refactoring, prepared publishing to npm finally
* 0.3.4: merged pull request #13 from Fuitad/master and updated README
* 0.3.3: merged pull request from codders/master and modified for backward compatibility. Usage and tests pending
* 0.3.2: merged pull request #7 from carlptr/master and added tests, modified fswrite to do sync writes
* 0.3.0: added configure and init with express support (calling guessLanguage() via 'accept-language')
* 0.2.0: added plurals
* 0.1.0: added tests
* 0.0.1: start

## Licensed under MIT

Copyright (c) 2011-2016 Marcus Spiegel <marcus.spiegel@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

[npm-image]: https://badge.fury.io/js/i18n.svg
[npm-url]: https://www.npmjs.com/package/i18n

[travis-image]: https://travis-ci.org/mashpie/i18n-node.svg?branch=master
[travis-url]: https://travis-ci.org/mashpie/i18n-node

[appveyor-image]: https://ci.appveyor.com/api/projects/status/677snewuop7u5xtl?svg=true
[appveyor-url]: https://ci.appveyor.com/project/mashpie/i18n-node

[coveralls-image]: https://coveralls.io/repos/github/mashpie/i18n-node/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/mashpie/i18n-node?branch=master

[dependency-image]: https://img.shields.io/gemnasium/mashpie/i18n-node.svg
[dependency-url]: https://gemnasium.com/mashpie/i18n-node
