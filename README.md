# Node.js: i18n-2

 * Designed to work out-of-the-box with Express.js
 * Lightweight simple translation module with dynamic json storage. 
 * Uses common __('...') syntax in app and templates.
 * Stores language files in json files compatible to [webtranslateit](http://webtranslateit.com/) json format.
 * Adds new strings on-the-fly when first used in your app.
 * No extra parsing needed.

## Installation

Run the following:

	npm install i18n-2

## Simple Example

Note: If you plan on using the module with Express.js, please view the on that, below.

	// Load Module and Instantiate
	var i18n = new (require('i18n-2'))({
		// setup some locales - other locales default to the first locale
		locales: ['en', 'de']
	});

	// Use it however you wish
	console.log( i18n.__("Hello!") );

## API:

### `new I18n(options)`

The `I18n` function is the return result from calling `require('i18n-2')`. You use this to instantiate an `I18n` instance and set any configuration options. You'll probably only do this if you're not using the `expressBind` method.

### `I18n.expressBind(app, options)`

You'll use this method to attach the i18n functionality to the request object inside Express.js. The app argument should be your Express.js app and the options argument should be the same as if you were calling `new I18n(options)`. See **"Using with Express.js"** at the end of this README for more details.

### `__(string, [...])`

Translates a string according to the current locale. Also supports sprintf syntax, allowing you to replace text, using the node-sprintf module.

For example:

	var greeting = i18n.__('Hello %s, how are you today?', 'Marcus');

this puts **Hello Marcus, how are you today?**. You might also add endless arguments or even nest it.

	var greeting = i18n.__('Hello %s, how are you today? How was your %s?', 
		'Marcus', i18n.__('weekend'));

which puts **Hello Marcus, how are you today? How was your weekend?**

You might even use dynamic variables. They get added to the current locale file if they do not yet exist.

	var greetings = ['Hi', 'Hello', 'Howdy'];
	for (var i = 0; i < greetings.length; i++) {
		console.log( i18n.__(greetings[i]) );
	};

which outputs:

	Hi
	Hello
	Howdy

### `__n(one, other, count, [...])`

Different plural forms are supported as a response to `count`:

	var singular = i18n.__n('%s cat', '%s cats', 1);
	var plural = i18n.__n('%s cat', '%s cats', 3);

this gives you **1 cat** and **3 cats**. As with `__(...)` these could be nested:

	var singular = i18n.__n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, 'tree');
	var plural = i18n.__n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, 'tree');

putting **There is one monkey in the tree** or **There are 3 monkeys in the tree**.

### `getLocale()`

Returns a string containing the current locale. If no locale has been specified then it default to the value specified in `defaultLocale`.

### `setLocale(locale)`

Sets a locale to the specified string. If the locale is unknown, the locale defaults to the one specified by `defaultLocale`. For example if you have locales of 'en' and 'de', and a `defaultLocale` of 'en', then call `.setLocale('ja')` it will be equivalent to calling `.setLocale('en')`.

### `setLocaleFromQuery([request])`

To be used with Express.js or another framework that provides a `request` object. Generally you would want to use this by setting the `query` option to `true`.

This method takes in an Express.js request object, looks at the query property, and specifically at the `lang` parameter. Reading the value of that parameter will then set the locale.

For example:

	example.com/?lang=de

Will then do:

	setLocale('de')

### `setLocaleFromSubdomain([request])`

To be used with Express.js or another framework that provides a `request` object. Generally you would want to use this by setting the `subdomain` option to `true`.

This method takes in an Express.js request object, looks at the hostname, and extracts the sub-domain. Reading the value of the subdomain the locale is then set.

For example:

	de.example.com

Will then do:

	setLocale('de')

### `setLocaleFromCookie([request])`

To be used with Express.js or another framework that provides a `request` object. This method takes a request object, looks at it's cookies property and tries to find a cookie named `cookieName` (default: `lang`).

See [Using with Express.js](#using-with-expressjs) for a complete example.

For example:

	console.log(req.cookies.lang)
	=> 'de'
	setLocaleFromCookie()

Will then do:

	setLocale('de')

### `isPreferredLocale()`

To be used with Express.js or another framework that provides a `request` object. This method works if a `request` option has been specified when the i18n object was instantiated.

This method returns true if the locale specified by `getLocale` matches a language desired by the browser's `Accept-language` header.

## Configuration

When you instantiate a new i18n object there are a few options that you can pass in. The only required option is `locales`.

### `locales`

You can pass in the locales in two ways: As an array of strings or as an object of objects. For example:

	locales: ['en', 'de']

This will set two locales (en and de) and read in the JSON contents of both translation files. (By default this is equal to "./locales/NAME.js", you can configure this by changing the `directory` and `extension` options.) Additionally when you pass in an array of locales the first locale is automatically set as the `defaultLocale`.

You can also pass in an object, like so:

	locales: {
		"en": {
			"Hello": "Hello"
		},
		"de": {
			"Hello": "Hallo"
		}
	}

In this particular case no files will ever be read when doing a translation. This is ideal if you are loading your translations from a different source. Note that no `defaultLocale` is set when you pass in an object, you'll need to set it yourself.

### `defaultLocale`

You can explicitly define a default locale to be used in cases where `.setLocale(locale)` is used with an unknown locale. For example if you have locales of 'en' and 'de', and a `defaultLocale` of 'en', then call `.setLocale('ja')` it will be equivalent to calling `.setLocale('en')`.

### `directory` and `extension`

These default to `"./locales"` and `".js"` accordingly. They are used for saving and reading the locale data files (see the `locales` option for more information on how this works).

When your server is in production mode it will read these files only once and then cache the result. It will not write any updated strings when in production mode.

When in development, or testing, mode the files will be read on every instantiation of the `i18n` object. Additionally newly-detected strings will be automatically added, and written out, to the locale JSON files.

A generated `en.js` inside `./locales/` may look something like:

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

that file can be edited or just uploaded to [webtranslateit](http://docs.webtranslateit.com/file_formats/) for any kind of collaborative translation workflow.

### `request`, `subdomain`, and `query`

These options are to be used with Express.js or another framework that provides a `request` object. In order to use the `subdomain` and `query` options you must specify the `request` option, passing in the Express.js `request` object.

If you pass in a `request` object a new `i18n` property will be attached to it, containing the i18n instance.

Note that you probably won't need to use `request` directly, if you use `expressBind` it is taken care of automatically.

Setting the `subdomain` option to `true` will run the `setLocaleFromSubdomain` method automatically on every request.

By default the `query` option is set to true. Setting the `query` option to `false` will stop the `setLocaleFromQuery` method from running automatically on every request.

### `register`

Copy the `__`, `__n`, `getLocale`, and `isPreferredLocale` methods over to the object specified by the `register` property.

	var obj = {};
	new I18n({ 'register': obj })
	console.log( obj.__("Hello.") );

### `devMode`

By default the `devMode` property is automatically set to be `false` if Node.js is in production mode and `true` otherwise. You can override this by setting a different value to the `devMode` option.

## Using with Express.js

### Load and Configure

In your app.js:

	// load modules
	var express = require('express'),
		I18n = require('i18n-2');

	// Express Configuration
	app.configure(function() {

		// ...

		// Attach the i18n property to the express request object
		// And attach helper methods for use in templates
		I18n.expressBind(app, {
			// setup some locales - other locales default to en silently
			locales: ['en', 'de'],
			// change the cookie name from 'lang' to 'locale'
			cookieName: 'locale'
		});
		
		// This is how you'd set a locale from req.cookies.
		// Don't forget to set the cookie either on the client or in your Express app.
		app.use(function(req, res, next) {
			req.i18n.setLocaleFromCookie();
			next();
		});

		// Set up the rest of the Express middleware
		app.use(app.router);
		app.use(express.static(__dirname + '/public'));
	});

### Inside Your Express View

	module.exports = {
		index: function(req, res) {
			res.render("index", {
				title: req.i18n.__("My Site Title"),
				desc: req.i18n.__("My Site Description")
			});
		}
	};

### Inside Your Templates

(This example uses the Swig templating system.)

	{% extends "page.swig" %}

	{% block content %}
	<h1>{{ __("Welcome to:") }} {{ title }}</h1>
	<p>{{ desc }}</p>
	{% endblock %}

## Changelog

* 0.4.5: a number of bug fixes
* 0.4.4: fix typo
* 0.4.3: fix issue with preferredLocale failing on useragents with no accept lang header
* 0.4.2: fix some issues with cache init
* 0.4.1: rename locale query string param to lang
* 0.4.0: made settings contained, and scoped, to a single object (complete re-write by jeresig)
* 0.3.5: fixed some issues, prepared refactoring, prepared publishing to npm finally
* 0.3.4: merged pull request #13 from Fuitad/master and updated README
* 0.3.3: merged pull request from codders/master and modified for backward compatibility. Usage and tests pending
* 0.3.2: merged pull request #7 from carlptr/master and added tests, modified fswrite to do sync writes
* 0.3.0: added configure and init with express support (calling guessLanguage() via 'accept-language')
* 0.2.0: added plurals
* 0.1.0: added tests
* 0.0.1: start 
