/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

var i18n = require('../i18n'),
    should = require("should"),
    fs = require('fs'),
    path = require('path'),
    faker = require('faker');

var i18nPath = 'i18n';
var i18nFilename = path.resolve(i18nPath + '.js');

function reconfigure(config) {
    delete require.cache[i18nFilename];
    i18n = require(i18nFilename);
    i18n.configure(config);
}

describe('configure Missing Translation Function', function() {

    it('should allow for a custom function to be passed if a translation is missing', function(done) {
        var customObject = {};
        var missingLocal;
        var missingValue; 
        reconfigure({
            locales: ['en', 'de'],
            register: customObject,
            missingTranslation: function(locale, value){
                missingLocal = locale;
                missingValue = value;
            }
        });
        var fakeValue = faker.lorem.sentence();
        customObject.setLocale('de');
        customObject.__(fakeValue)
        missingLocal.should.eql('de');
        missingValue.should.eql(fakeValue);
        done();
    });


});