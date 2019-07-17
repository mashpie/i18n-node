var i18n = require('../i18n'),
  should = require("should")

describe('i18n.Constructor()', function() {

  var TestScope;

  beforeEach(function() {
    TestScope = {
      scope: {
        locale: 'de'
      }
    };
    i18n.configure({
      locales: ['de', 'en'],
      directory: './locales',
      register: TestScope,
      updateFiles: false
    });
  });

  it('should instanciate a separate i18n', function(done) {
    var i18n2 = new i18n.Constructor();
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
    i18n.setLocale('de')
    should.equal(i18n.__('Bye'), 'Bye')
    done();
  });

});