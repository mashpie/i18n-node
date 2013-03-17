require('./express-cookies');

var should = require('should'),
    Browser = require('zombie'),
    async = require('async'),
    DE = new Browser(),
    EN = new Browser();
EN.cookies('localhost', '/').set("yourcookiename", "en");
DE.cookies('localhost', '/').set("yourcookiename", "de");

visitLinks = function (asyncMethod, url, textEN, textDE) {
  return it('should show '+textEN+' in EN and '+textDE+' in DE', function (done) {
    return async[asyncMethod]([

    function (cb) {

      return EN.visit('http://localhost:3000/'+url+'/?delay=1000', function () {
        EN.text('body').should.equal(textEN);
        return cb();
      });

    },

    function (cb) {
      return setTimeout(function () {

        return DE.visit('http://localhost:3000/'+url+'/', function () {
          DE.text('body').should.equal(textDE);
          return cb();
        });

      }, 200);
    }

    ],

    done);

  });
};

describe('res.__() is able to handle concurrent request correctly', function(){
    describe('serial requests return different languages', function () {
      return visitLinks('series', 'test', 'Hello', 'Hallo');
    });

    describe('parallel requests return different languages', function () {
      return visitLinks('series', 'test', 'Hello', 'Hallo');
    });
})

describe('i18n.__() is NOT able to handle concurrent request correctly', function(){
    describe('serial requests return different languages', function () {
      return visitLinks('series', 'testfail', 'Hello', 'Hello');
    });

    describe('parallel requests return different languages', function () {
      return visitLinks('series', 'testfail', 'Hello', 'Hello');
    });
})