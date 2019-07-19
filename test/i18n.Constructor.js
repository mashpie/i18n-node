'use strict';
var i18n = require('../i18n'),
  should = require("should")

describe('i18n.Constructor()', function() {

  var TestScope;

  beforeEach(function(d) {
    TestScope = {};
    i18n.configure({
      locales: ['de', 'en'],
      directory: './locales',
      register: TestScope,
      updateFiles: false
    });
    setTimeout(function () {
      d();
    }, 300);
  });

  it('should instanciate a separate i18n', function(done) {
    var i18n2 = new i18n.Constructor();

    should.equal(i18n.__('Hello'), 'Hello')

    i18n2.configure({
      locales: ['de', 'en'],
      directory: './locales2',
      register: TestScope,
      updateFiles: false,
      syncFiles: false
    });

    should.equal(i18n2.__('Bye'), 'Bye')
    i18n2.setLocale('de')
    should.equal(i18n2.__('Bye'), 'Tschuss')
    
    should.equal(i18n.__('Hello'), 'Hello')
    i18n.setLocale('de')
    should.equal(i18n.__('Bye'), 'Bye')
    should.equal(i18n.__('Hello'), 'Hallo')
    done();
  });

});