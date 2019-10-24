# Changelog

For current release notes see [GitHub Release Notes](https://github.com/mashpie/i18n-node/releases). 

## Changes until 0.8.3

* 0.8.3:
    + __fixed__: #235 objectNotation, #231 Plurals support regions ("en-US", "de-DE")
* 0.8.2:
    * __fixed__: typos, objectNotation mutator #226, accept-language headers with fallback #228
* 0.8.1:
    * __hotfix__: fixes `i18n.setLocale()` recursion bug on nested res-/req-objects [sails#3631](https://github.com/balderdashy/sails/pull/3631)
* 0.8.0:
    * __improved__: `i18n.__n()` supports all plurals
    * __new__: added MessageFormat by explicit `i18n.__mf()`, `api` alias option, `syncFiles` option
    * __fixed__: typos, missing and wrong docs, plural bugs like: #210, #191, #190 
* 0.7.0:
    * __improved__: `i18n.setLocale()` and `i18n.init()` refactored to comply with most common use cases, much better test coverage and docs
    * __new__: options: `autoReload`, `directoryPermissions`, `register`, `queryParameter`, read locales from filenames with empty `locales` option (#134)
    * __fixed__: typos, missing and wrong docs, issues related to `i18n.setLocale()`
* 0.6.0:
    * __improved__: Accept-Language header parsing to ICU, delimiters with object notation, jshint, package.json, README;
    * __new__: prefix for locale files, `i18n.getLocales()`, custom logger, fallback[s];
    * __fixed__: typos, badges, plural (numbers), `i18n.setLocale()` for `req` _and_ `res`
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