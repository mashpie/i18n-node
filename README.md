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
in your app.js

	// load modules
	var express = require('express'),
	    i18n = require("i18n");
	
now you are ready to use `i18n.__('Hello')`.

## Configure
use configure to setup these:

    i18n.configure({
        // setup some locales - other locales default to en silently
        locales:['en', 'de'],

        // where to register __() and __n() to, might be "global" if you know what you are doing
        register: global
    });

**CAREFULL:** as jade uses `__` as internal variable you need to register view helpers tweaked to your needs when used with jade.

### tweak helpers 
configure i18n without register: global

	i18n.configure({
	    // setup some locales - other locales default to en silently
	    locales:['en', 'de'],
	});

and register view helpers on your own

	// register helpers for use in templates
	app.helpers({
	  __i: i18n.__,
	  __n: i18n.__n
	});

### hook into express configure

in an express app, you might use i18n.init to gather language settings of your visitors, ie:

	// Configuration
	app.configure(function() {

    	[...]

	    // using 'accept-language' header to guess language settings
	    app.use(i18n.init);
	    app.use(app.router);
	    app.use(express.static(__dirname + '/public'));
	});
	
## Use

in your app

	var greeting = __('Hello');
	
in your template (depending on your template compiler)
	
	<%= __('Hello') %>
	
	${__('Hello')}
	
### sprintf support

	var greeting = __('Hello %s, how are you today?', 'Marcus');
	
this puts **Hello Marcus, how are you today?**. You might add endless arguments and even nest it.

	var greeting = __('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend'));
	
which puts **Hello Marcus, how are you today? How was your weekend.**

### variable support

you might even use dynamic variables. They get added to the `en.js` file if not yet existing.

	var greetings = ['Hi', 'Hello', 'Howdy'];        
    for (var i=0; i < greetings.length; i++) {
        console.log( __(greetings[i]) );
    };

which puts 

	Hi
	Hello
	Howdy

### plural support

different plural froms are supported as response to `count`:

	var singular = __n('%s cat', '%s cats', 1);
    var plural = __n('%s cat', '%s cats', 3);

this puts **1 cat** or **3 cats**
and again these could get nested:

	var singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, 'tree');
	var plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, 'tree');
	
putting **There is one monkey in the tree** or **There are 3 monkeys in the tree**

## Storage

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

* 0.3.5: fixed some issues, prepared refactoring, prepared publishing to npm finally
* 0.3.4: merged pull request #13 from Fuitad/master and updated README
* 0.3.3: merged pull request from codders/master and modified for backward compatibility. Usage and tests pending
* 0.3.2: merged pull request #7 from carlptr/master and added tests, modified fswrite to do sync writes
* 0.3.0: added configure and init with express support (calling guessLanguage() via 'accept-language')
* 0.2.0: added plurals
* 0.1.0: added tests
* 0.0.1: start 