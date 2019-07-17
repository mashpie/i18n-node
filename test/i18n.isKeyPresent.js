var i18n = require('../i18n'),
  should = require("should")

describe('i18n.__e()', function() {

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
      updateFiles: false,
      syncFiles: false
    });
  });

  it('should instanciate a separate i18n', function(done) {
    i18n.setLocale('de')
    should.equal(i18n.__e('Bye'), false)
    should.equal(i18n.__e('Hello'), true)
    should.equal(i18n.__e('Bye', 'en'), false)
    should.equal(i18n.__e('Hello', 'en'), true)
    should.equal(i18n.__e('Bye', 'ru'), false)
    done();
  });

});