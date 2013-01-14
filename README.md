# i18n-node-2

 * Designed to work out-of-the-box with Express.js
 * Lightweight simple translation module with dynamic json storage. 
 * Uses common __('...') syntax in app and templates.
 * Stores language files in json files compatible to [webtranslateit](http://webtranslateit.com/) json format.
 * Adds new strings on-the-fly when first used in your app.
 * No extra parsing needed.

## Example

	// Load Module and Instantiate
	var i18n = new (require('i18n'))({
		// setup some locales - other locales default to the first locale silently
		locales: ['en', 'de']
	});

	// Use it however you wish
	console.log( i18n.__("Hello!") );

## API:

### `__(string, [...])`

	var greeting = __('Hello %s, how are you today?', 'Marcus');
	
this puts **Hello Marcus, how are you today?**. You might add endless arguments and even nest it.

	var greeting = __('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend'));
	
which puts **Hello Marcus, how are you today? How was your weekend.**

you might even use dynamic variables. They get added to the `en.js` file if not yet existing.

	var greetings = ['Hi', 'Hello', 'Howdy'];
	for (var i=0; i < greetings.length; i++) {
		console.log( __(greetings[i]) );
	};

which puts 

	Hi
	Hello
	Howdy

### `__n(one, other, num, [...])`

different plural froms are supported as response to `count`:

	var singular = __n('%s cat', '%s cats', 1);
	var plural = __n('%s cat', '%s cats', 3);

this puts **1 cat** or **3 cats**
and again these could get nested:

	var singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, 'tree');
	var plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, 'tree');

putting **There is one monkey in the tree** or **There are 3 monkeys in the tree**


### `getLocale()`

### `setLocale(locale)`

### `setLocaleFromQuery([request])`

### `setLocaleFromHost([request])`

### `isPreferredLocale()`

Requires request option.

## Configuration

When you instantiate a new i18n object there are a few options that you can pass in.
The only required option is `locales`.

### `locales`

You can pass in the locales in two ways: As an array of strings or as an object of objects.
For example:

	locales: ['en', 'de']

This will set two locales (en and de) and read in the JSON contents of both translation files.
(By default this is equal to "./locales/NAME.js", you can configure this by changing the
`directory` and `extension` options.) Additionally when you pass in an array of locales the
first locale is automatically set as the `defaultLocale`.

You can also pass in an object, like so:

	locales: {
		"en": {
			"Hello": "Hello"
		},
		"de": {
			"Hello": "Hallo"
		}
	}

In this particular case no files will ever be read when doing a translation. This is ideal if
you are loading your translations from a different source. Note that no `defaultLocale` is
set when you pass in an object, you'll need to set it yourself.

### `defaultLocale`

### `locale`

### `directory` and `extension`

the above will automatically generate a `en.js` by default inside `./locales/` which looks like

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
			"other": "Im Baum sitzen %d Affen"
		},
		"tree": "Baum"
	}


### `request`, `host`, and `query`

### `register`

### `devMode`

## Using with Express.js

### Load and Configure

In your app.js:

	// load modules
	var express = require('express'),
		I18n = require('i18n');

	// Express Configuration
	app.configure(function() {

		// ...

		// Attach the i18n property to the express request object
		// And attach helper methods for use in templates
		I18n.expressBind(app, {
			// setup some locales - other locales default to en silently
			locales: ['en', 'de']
		}));

		// Set up the rest of the Express middleware
		app.use(app.router);
		app.use(express.static(__dirname + '/public'));
	});

### Inside Your Express View

	module.exports = {
		index: function(req, res) {
			req.render("index", {
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

* 0.4.0: made settings contained, and scoped, to a single object (complete re-write by jeresig)
* 0.3.5: fixed some issues, prepared refactoring, prepared publishing to npm finally
* 0.3.4: merged pull request #13 from Fuitad/master and updated README
* 0.3.3: merged pull request from codders/master and modified for backward compatibility. Usage and tests pending
* 0.3.2: merged pull request #7 from carlptr/master and added tests, modified fswrite to do sync writes
* 0.3.0: added configure and init with express support (calling guessLanguage() via 'accept-language')
* 0.2.0: added plurals
* 0.1.0: added tests
* 0.0.1: start 
