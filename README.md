# i18n

Lightweight simple translation module with dynamic json storage. 
Uses common __('...') syntax in app and templates.
Stores language files in json files compatible to [webtranslateit](http://webtranslateit.com/) json format.
Adds new strings on-the-fly when first used in your app.
No extra parsing needed.

[![Build Status](https://secure.travis-ci.org/mashpie/i18n-node.png?branch=master)](http://travis-ci.org/mashpie/i18n-node)

## Install

	npm install i18n
	
## Test 

	npm test

## Load

	// load modules
	var express = require('express'),
	    i18n = require("i18n");
	
now you are ready to use a global `i18n.__('Hello')`. **Global** assumes you share a common state of localizsation in any time and any part of your app. This is usually fine in cli-style scripts. When serving responses to http requests you'll need to make sure that scope is __NOT__ shared globally but attached to your request object.

## Configure

Minimal example, just setup two locales

    i18n.configure({
        locales:['en', 'de']
    });

 optionally register helpers to _global_ scope in your cli. 

	i18n.configure({
	    locales:['en', 'de'],
        register: global 
	});

 **Be warned**: Globals are only intended to get used in cli-like apps. To avoid concurency issues in server-like apps you'll need to attach helpers on your own to any kind of request- or response-object 

### list of configuration options

	i18n.configure({
	    // setup some locales - other locales default to en silently
	    locales:['en', 'de'],

	    // you may alter a site wide default locale
	    defaultLocale: 'de',

	    // sets a custom cookie name to parse locale settings from  - defaults to NULL
	    cookie: 'yourcookiename',

	    // where to store json files - defaults to './locales'
	    directory: './mylocales',

	    // whether to write new locale information to disk - defaults to true
	    updateFiles: false,

	    // setting extension of json files - defaults to '.json' (you might want to set this to '.js' according to webtranslateit)
	    extension: '.js',

	    // enabled some debug output - defaults to false
	    debug: true
	});

## Basic global use

In your app, when registered global:

	var greeting = __('Hello');

in your app, when not registered to a specific object:

	var greeting = i18n.__('Hello');

## Example usage in express.js

In an express app, you might use i18n.init to gather language settings of your visitors and also bind your helpers to response object honoring request objects locale, ie:

	// Configuration
	app.configure(function() {

    	[...]

	    // default: using 'accept-language' header to guess language settings
	    app.use(i18n.init);

	    // binding template helpers to request (Credits to https://github.com/enyo #12)
		app.use(function(req, res, next) {
		  res.locals.__ = res.__ = function() {
		    return i18n.__.apply(req, arguments);
		  };
		  res.locals.__n = res.__n = function() {
		    return i18n.__n.apply(req, arguments);
		  };
		  // do not forget this, otherwise your app will hang
		  next();
		});

	    app.use(app.router);
	    app.use(express.static(__dirname + '/public'));
	});

in your app, when registered to a request object by `i18n.init`:

	app.get('/de', function(req, res){
      var greeting = res.__('Hello');
    });


in your template (depending on your template compiler)
	
	<%= __('Hello') %>
	
	${__('Hello')}
	

## Output parsing of expressions

As inspired by gettext there is currently support for sprintf-style expressions. Named parameters are on roadmap.

### sprintf support

	var greeting = __('Hello %s, how are you today?', 'Marcus');
	
this puts *Hello Marcus, how are you today?*. You might add endless arguments and even nest it.

	var greeting = __('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend'));
	
which puts *Hello Marcus, how are you today? How was your weekend.*

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

different plural froms are supported as response to `count`:

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

## Changelog

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

Copyright (c) 2011-2013 Marcus Spiegel <marcus.spiegel@gmail.com>

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
