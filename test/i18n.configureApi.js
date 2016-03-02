/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

var i18n = require('../i18n'),
    should = require("should"),
    fs = require('fs'),
    path = require('path');

var i18nPath = 'i18n';
var i18nFilename = path.resolve(i18nPath + '.js');

function reconfigure(config) {
    delete require.cache[i18nFilename];
    i18n = require(i18nFilename);
    i18n.configure(config);
}

describe('configure api', function() {

    it('should set an alias method on the object', function() {
        var customObject = {};
        reconfigure({
            locales: ['en', 'de'],
            register: customObject,
            api: {
              '__': 't'
            }
        });
        should.equal(typeof customObject.t, 'function');
        should.equal(customObject.t('Hello'), 'Hello');
        customObject.setLocale('de');
        should.equal(customObject.t('Hello'), 'Hallo');
    });

    it('should work for any existing API method', function() {
        var customObject = {};
        reconfigure({
            locales: ['en', 'de'],
            register: customObject,
            api: {
              'getLocale': 'getLocaleAlias'
            }
        });
        should.equal(typeof customObject.getLocaleAlias, 'function');
        customObject.setLocale('de');
        should.equal(customObject.getLocaleAlias(), 'de');
    });

    it('should ignore non existing API methods', function() {
        var customObject = {};
        reconfigure({
            locales: ['en', 'de'],
            register: customObject,
            api: {
              'nonExistingMethod': 'alias'
            }
        });
        should.equal(typeof customObject.nonExistingMethod, 'undefined');
    });

    it('should not expose the actual API methods', function() {
        var customObject = {};
        reconfigure({
            locales: ['en', 'de'],
            register: customObject,
            api: {
              '__': 't'
            }
        });
        should.equal(typeof customObject.__, 'undefined');
    });

    it('should escape res -> locals -> res recursion', function() {
        var customObject = {};
        customObject.locals = { res: customObject };
        reconfigure({
            locales: ['en', 'de'],
            register: customObject,
            api: {
              '__': 't'
            }
        });
        should.equal(typeof customObject.t, 'function');
        should.equal(typeof customObject.locals.t, 'function');
    });
});
