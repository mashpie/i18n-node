require('./express-cookies');

var Browser = require('zombie'),
    visitLinks = require('../testlib/visitLinks'),
    DE = new Browser(),
    EN = new Browser();
EN.cookies('localhost', '/').set("yourcookiename", "en");
DE.cookies('localhost', '/').set("yourcookiename", "de");

describe('res.__() is able to handle concurrent request correctly', function(){
    describe('serial requests return different languages', function () {
      visitLinks('series', 'test', EN, 'Hello', DE, 'Hallo');
    });

    describe('parallel requests return different languages', function () {
      visitLinks('series', 'test', EN, 'Hello', DE, 'Hallo');
    });
})

describe('i18n.__() is NOT able to handle concurrent request correctly', function(){
    describe('serial requests return different languages', function () {
      visitLinks('series', 'testfail', EN, 'Hello', DE, 'Hello');
    });

    describe('parallel requests return different languages', function () {
      visitLinks('series', 'testfail', EN, 'Hello', DE, 'Hello');
    });
})