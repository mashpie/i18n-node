# i18n

Lightweight simple translation module with dynamic json storage. 
Uses common __('...') syntax in app and templates.
Stores language files in json files compatible to [webtranslateit](http://webtranslateit.com/) json format.
Adds new strings on-the-fly when first used in your app.
No extra parsing needed.

## Install

	npm install i18n

## Usage

### load and configure with express

in your app.js

	// load modules
	var express = require('express'),
	    i18n = require("i18n");
	
	// register helpers for use in templates
	app.helpers({
	  __: i18n.__
	});
	
	// or even a global for use in your app.js
	var __= i18n.__;
	
### simple usage

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

### json file

the above will automatically generate a `en.js` by default inside `./locales/` which looks like

	{
	    "Hello":"Hello",
	    "Hello %s, how are you today?":"Hello %s, how are you today?",
	    "weekend":"weekend",
	    "Hello %s, how are you today? How was your %s.":"Hello %s, how are you today? How was your %s."
	}

that file can be edited or just uploaded to webtranslateit for any kind of collaborative translation workflow.