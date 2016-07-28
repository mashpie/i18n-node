var i18n = require('../i18n'),
  should = require("should");

describe('Locales test', function () {

  beforeEach(function () {

    i18n.configure({
      locales: ['en', 'de'],
      directory: './locales',
      register: global
    });

  });

  it('locales will get all locales', function () {
    i18n.locales['en']['Hello'].should.equal('Hello');
    i18n.locales['de']['Hello'].should.equal('Hallo');
  });
});