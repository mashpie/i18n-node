# i18n

Lightweight simple translation module with dynamic json storage. Supports plain vanilla node.js apps and should work with any framework (like _express_, _restify_ and probably more) that exposes an `app.use()` method passing in `res` and `req` objects.
Uses common __('...') syntax in app and templates.
Stores language files in json files compatible to [webtranslateit](http://webtranslateit.com/) json format.
Adds new strings on-the-fly when first used in your app.
No extra parsing needed.

[![Build Status](https://secure.travis-ci.org/mashpie/i18n-node.png?branch=master)](http://travis-ci.org/mashpie/i18n-node) [![NPM version](https://badge.fury.io/js/i18n.png)](http://badge.fury.io/js/i18n)
[![Dependency Status](https://gemnasium.com/mashpie/i18n-node.png)](https://gemnasium.com/mashpie/i18n-node)

## Install

	npm install i18n

## Test

	npm test

## Load

	// load modules
	var express = require('express'),
	    i18n = require("i18n");

now you are ready to use a global `i18n.__('Hello')`. **Global** assumes you share a common state of localization in any time and any part of your app. This is usually fine in cli-style scripts. When serving responses to http requests you'll need to make sure that scope is __NOT__ shared globally but attached to your request object.

## Configure

Minimal example, just setup two locales and a project specific directory

    i18n.configure({
        locales:['en', 'de'],
        directory: __dirname + '/locales'
    });

### list of configuration options

	i18n.configure({
	    // setup some locales - other locales default to en silently
	    locales:['en', 'de'],

	    // you may alter a site wide default locale
	    defaultLocale: 'de',

	    // sets a custom cookie name to parse locale settings from  - defaults to NULL
	    cookie: 'yourcookiename',

	    // where to store json files - defaults to './locales' relative to modules directory
	    directory: './mylocales',

	    // whether to write new locale information to disk - defaults to true
	    updateFiles: false,

	    // what to use as the indentation unit - defaults to "\t"
	    indent: "\t",

	    // setting extension of json files - defaults to '.json' (you might want to set this to '.js' according to webtranslateit)
	    extension: '.js',

	    // enable object notation
	    objectNotation: false
	});

## Example usage in gobal scope

In your app, when not registered to a specific object:

	var greeting = i18n.__('Hello');

## Example usage in express.js

In an express app, you might use i18n.init to gather language settings of your visitors and also bind your helpers to response object honoring request objects locale, ie:

	// Configuration
	app.configure(function() {

    	[...]

	    // default: using 'accept-language' header to guess language settings
	    app.use(i18n.init);

	    [...]
	});

in your apps methods:

	app.get('/de', function(req, res){
      var greeting = res.__('Hello');
    });


in your templates (depending on your template engine)

	<%= __('Hello') %>

	${__('Hello')}


## Examples for common setups

See [tested examples](https://github.com/mashpie/i18n-node/tree/master/examples) inside `/examples` or browse these gists:

* [plain node.js + http](https://gist.github.com/mashpie/5188567)
* [plain node.js + restify](https://gist.github.com/mashpie/5694251)
* [express 3 + cookie](https://gist.github.com/mashpie/5124626)
* [express 3 + hbs 2 (+ cookie)](https://gist.github.com/mashpie/5246334)
* [express 3 + mustache (+ cookie)](https://gist.github.com/mashpie/5247373)
* [express 3 + jade 0.3 (+ cookie)](https://gist.github.com/hankwang/5994144)
* [express 4 + + cookie](https://gist.github.com/mashpie/08e5a0ee764f7b6b1355)

## API

### __()

Translates a single phrase and adds it to locales if unknown. Returns translated parsed and substituted string.

	// template and global (this.locale == 'de')
	__('Hello'); // Hallo
	__('Hello %s', 'Marcus'); // Hallo Marcus
	__('Hello {{name}}', { name: 'Marcus' }); // Hallo Marcus


	// scoped via req object (req.locale == 'de')
	req.__('Hello'); // Hallo
	req.__('Hello %s', 'Marcus'); // Hallo Marcus
	req.__('Hello {{name}}', { name: 'Marcus' }); // Hallo Marcus

	// passing specific locale
	__({phrase: 'Hello', locale: 'fr'}); // Salut
	__({phrase: 'Hello %s', locale: 'fr'}, 'Marcus'); // Salut Marcus
	__({phrase: 'Hello {{name}}, locale: 'fr'}, { name: 'Marcus' }); // Salut Marcus

### __n()

Plurals translation of a single phrase. Singular and plural forms will get added to locales if unknown. Returns translated parsed and substituted string based on `count` parameter.

	// template and global (this.locale == 'de')
	__n("%s cat", "%s cats", 1); // 1 Katze
	__n("%s cat", "%s cats", 3); // 3 Katzen

	// scoped via req object (req.locale == 'de')
	req.__n("%s cat", "%s cats", 1); // 1 Katze
	req.__n("%s cat", "%s cats", 3); // 3 Katzen

	// passing specific locale
	__n({singular: "%s cat", plural: "%s cats", locale: "fr"}, 1); // 1 chat
	__n({singular: "%s cat", plural: "%s cats", locale: "fr"}, 3); // 3 chat

	__n({singular: "%s cat", plural: "%s cats", locale: "fr", count: 1}); // 1 chat
	__n({singular: "%s cat", plural: "%s cats", locale: "fr", count: 3}); // 3 chat

### setLocale()

Setting the current locale (ie.: `en`) globally or in current scope.

	setLocale('de');
	setLocale(req, 'de');
	req.setLocale('de');

To change the initial locale (when you set it on `i18n.init()`) for all the user session (eg.: you have a language
selector on your web page to let the user select the preferred language), you have some options.
You could set it via `res.setLocale('de')` on each loop before load the each page.
Or you could manage it via any session middleware or by setting a cookie in the client and let i18n read it's value.

In the last case you will need to enable cookies (eg. for express will be `app.use(express.cookieParser())`) and then
you can use the `i18n.configure.cookie` to let i18n which language must use. Simply use the same cookie name when setting it in the user preferred language, like here:

	res.cookie('yourcookiename', 'de', { maxAge: 900000, httpOnly: true });

After this and until the cookie expires, i18n will get the value of the cookie and will set that language instead of default for every page.

### getLocale()

Getting the current locale (ie.: `en`) from current scope or globally.

	getLocale(); // --> de
	getLocale(req); // --> de
	req.getLocale(); // --> de

### getCatalog()

Returns a whole catalog optionally based on current scope and locale.

	getCatalog(); // returns all locales
	getCatalog('de'); // returns just 'de'

	getCatalog(req); // returns all locales
	getCatalog(req, 'de'); // returns just 'de'

	req.getCatalog(); // returns all locales
	req.getCatalog('de'); // returns just 'de'



## Optionally manual attaching helpers for different template engines

In general i18n has to be attached to the response object to let it's public api get accessible in your templates and methods. As of **0.4.0** i18n tries to do so internally via `i18n.init`, as if you were doing it in `app.configure` on your own:

	app.use(function(req, res, next) {
		// express helper for natively supported engines
		res.locals.__ = res.__ = function() {
			return i18n.__.apply(req, arguments);
		};

		[...]

		next();
	});

Different engines need different implementations, so yours might miss or not work with the current default helpers. This one showing an example for mustache in express:

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

You could still setup your own implementation. Please refer to Examples below, post an issue or contribute your setup.

## Output parsing of expressions

As inspired by gettext there is currently support for sprintf-style expressions. Named parameters are on roadmap.

### sprintf support

	var greeting = __('Hello %s, how are you today?', 'Marcus');

this puts *Hello Marcus, how are you today?*. You might add endless arguments and even nest it.

	var greeting = __('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend'));

which puts *Hello Marcus, how are you today? How was your weekend.*

### mustache support

You may also use [mustache](http://mustache.github.io/) syntax for your message strings. To pass named parameters to your message, just provide an object as the second parameter. You can still pass unnamed parameters by adding additional arguments.

	var greeting = __('Hello {{name}}, how are you today?', { name: 'Marcus' });

this puts *Hello Marcus, how are you today?*. You might also combine it with sprintf arguments and also nest it.

	var greeting = __('Hello {{name}}, how was your %s.', { name: 'Marcus' }, __('weekend'));

which puts *Hello Marcus, how was your weekend.*

### variable support

you might even use dynamic variables as they get interpreted on the fly. Better make sure no user input finds it's way to that point as they all get added to the `en.js` file if not yet existing.

	var greetings = ['Hi', 'Hello', 'Howdy'];
    for (var i=0; i < greetings.length; i++) {
        console.log( __(greetings[i]) );
    };

which puts

	Hi
	Hello
	Howdy

### basic plural support

two different plural forms are supported as response to `count`:

	var singular = __n('%s cat', '%s cats', 1);
    var plural = __n('%s cat', '%s cats', 3);

this puts **1 cat** or **3 cats**
and again these could get nested:

	var singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, 'tree');
	var plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, 'tree');

putting *There is one monkey in the tree* or *There are 3 monkeys in the tree*

## Storage

Will get modular support for different storage engines, currently just json files are stored in filesystem.

### json file

the above will automatically generate a `en.json` by default inside `./locales/` which looks like

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

that file can be edited or just uploaded to [webtranslateit](http://docs.webtranslateit.com/file_formats/) for any kind of collaborative translation workflow:

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

## Logging & Debugging

Logging any kind of output is moved to [debug](https://github.com/visionmedia/debug) module. To let i18n output anything run your app with `DEBUG` env set like so:

	$ DEBUG=i18n:* node app.js

i18n exposes three log-levels:

* i18n:debug
* i18n:warn
* i18n:error

if you only want to get errors and warnings reported start your node server like so:

	$ DEBUG=i18n:warn,i18n:error node app.js

Combine those settings with you existing application if any of you other modules or libs also uses __debug__

## Object notation

In addition to the traditional, linear translation lists, i18n also supports hierarchical translation catalogs.

To enable this feature, be sure to set `objectNotation` to `true` in your `configure()` call.

Instead of calling `__("Hello")` you might call `__("greeting.formal")` to retrieve a formal greeting from a translation document like this one:

    "greeting": {
        "formal": "Hello",
        "informal": "Hi",
        "placeholder": {
            "formal": "Hello %s",
            "informal": "Hi %s"
        }
    }

In the document, the translation terms, which include placeholders, are nested inside the "greeting" translation. They can be accessed and used in the same way, like so `__('greeting.placeholder.informal', 'Marcus')`.

### Pluralization

Object notation also supports pluralization. When making use of it, the "one" and "other" entries are used implicitly for an object in the translation document. For example, consider the following document:

    "cat": {
        "one": "Katze",
        "other": "Katzen"
    }

When accessing these, you would use `__n("cat", "cat", 3)` to tell i18n to use both the singular and plural form of the "cat" entry. Naturally, you could also access these members explicitly with `__("cat.one")` and `__("cat.other")`.

### Defaults

When starting a project from scratch, your translation documents will probably be empty. i18n takes care of filling your translation documents for you. Whenever you use an unknown object, it is added to the translation documents.

By default, when using object notation, the provided string literal will be inserted and returned as the default string. As an example, this is what the "greeting" object shown earlier would look like by default:

    "greeting": {
        "formal": "greeting.formal",
        "informal": "greeting.informal"
    }

In case you would prefer to have a default string automatically inserted and returned, you can provide that default string by appending it to your object literal, delimited by a `:`. For example:

    __("greeting.formal:Hello")
    __("greeting.placeholder.informal:Hi %s")

## Changelog

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

Copyright (c) 2011-2014 Marcus Spiegel <marcus.spiegel@gmail.com>

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
