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

describe('i18n.__l() - return a list of translations', function() {

    it('should work on a custom object', function() {
        var customObject = {};
        reconfigure({
            locales: ['en', 'de'],
            register: customObject
        });

        //
        should.deepEqual(i18n.__l('Hello'), [ 'Hallo', 'Hello' ]);
        should.deepEqual(customObject.__l('Hello'), [ 'Hallo', 'Hello' ]);
    });

    it('should work on list of objects', function() {
        var obj1 = {}, obj2 = {};
        reconfigure({
            locales: ['en', 'de', 'fr'],
            register: [obj1, obj2]
        });
        should.deepEqual(obj1.__l('Hello'), [ 'Hallo', 'Hello', 'Bonjour' ]);
        should.deepEqual(obj2.__l('Hello'), [ 'Hallo', 'Hello', 'Bonjour' ]);

        // sets both
        i18n.setLocale('fr');
        should.deepEqual(obj1.__l('Hello'), [ 'Hallo', 'Hello', 'Bonjour' ]);
        should.deepEqual(obj2.__l('Hello'), [ 'Hallo', 'Hello', 'Bonjour' ]);

        // sets both too
        obj1.setLocale('en');
        should.deepEqual(obj1.__l('Hello'), [ 'Hallo', 'Hello', 'Bonjour' ]);
        should.deepEqual(obj2.__l('Hello'), [ 'Hallo', 'Hello', 'Bonjour' ]);

        // sets obj2 only
        i18n.setLocale([obj2], 'de');
        should.deepEqual(obj1.__l('Hello'), [ 'Hallo', 'Hello', 'Bonjour' ]);
        should.deepEqual(obj2.__l('Hello'), [ 'Hallo', 'Hello', 'Bonjour' ]);

        // sets obj2 only
        i18n.setLocale(obj2, 'fr', true);
        should.deepEqual(obj1.__l('Hello'), [ 'Hallo', 'Hello', 'Bonjour' ]);
        should.deepEqual(obj2.__l('Hello'), [ 'Hallo', 'Hello', 'Bonjour' ]);
    });
});

describe('i18n.__h() - return a hash of translations', function() {

    it('should work on a custom object', function() {
        var customObject = {};
        reconfigure({
            locales: ['en', 'de'],
            register: customObject
        });


        should.deepEqual(i18n.__h('Hello'), [ { de: 'Hallo' }, { en: 'Hello' } ]);
        should.deepEqual(customObject.__h('Hello'), [ { de: 'Hallo' }, { en: 'Hello' } ]);
    });

    it('should work on list of objects', function() {
        var obj1 = {}, obj2 = {};
        reconfigure({
            locales: ['en', 'de', 'fr'],
            register: [obj1, obj2]
        });

        should.deepEqual(obj1.__h('Hello'), [ { de: 'Hallo' }, { en: 'Hello' }, { fr: 'Bonjour' } ]);
        should.deepEqual(obj2.__h('Hello'), [ { de: 'Hallo' }, { en: 'Hello' }, { fr: 'Bonjour' } ]);

        // sets both
        i18n.setLocale('fr');
        should.deepEqual(obj1.__h('Hello'), [ { de: 'Hallo' }, { en: 'Hello' }, { fr: 'Bonjour' } ]);
        should.deepEqual(obj2.__h('Hello'), [ { de: 'Hallo' }, { en: 'Hello' }, { fr: 'Bonjour' } ]);

        // sets both too
        obj1.setLocale('en');
        should.deepEqual(obj1.__h('Hello'), [ { de: 'Hallo' }, { en: 'Hello' }, { fr: 'Bonjour' } ]);
        should.deepEqual(obj2.__h('Hello'), [ { de: 'Hallo' }, { en: 'Hello' }, { fr: 'Bonjour' } ]);

        // sets obj2 only
        i18n.setLocale([obj2], 'de');
        should.deepEqual(obj1.__h('Hello'), [ { de: 'Hallo' }, { en: 'Hello' }, { fr: 'Bonjour' } ]);
        should.deepEqual(obj2.__h('Hello'), [ { de: 'Hallo' }, { en: 'Hello' }, { fr: 'Bonjour' } ]);

        // sets obj2 only
        i18n.setLocale(obj2, 'fr', true);
        should.deepEqual(obj1.__h('Hello'), [ { de: 'Hallo' }, { en: 'Hello' }, { fr: 'Bonjour' } ]);
        should.deepEqual(obj2.__h('Hello'), [ { de: 'Hallo' }, { en: 'Hello' }, { fr: 'Bonjour' } ]);
    });
});