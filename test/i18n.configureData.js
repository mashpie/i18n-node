var i18n = require('../i18n'),
  should = require("should"),
  path = require("path");

var i18nPath = 'i18n';
var i18nFilename = path.resolve(i18nPath + '.js');

function reconfigure(config) {
  delete require.cache[i18nFilename];
  i18n = require(i18nFilename);
  i18n.configure(config);
};

describe('data api', function() {
  it('any data set in the data option becomes the in-memory source of all translations', function() {
    reconfigure({
      data: {
        'en': {'wazzup': 'What\'s up'},
        'it': {wazzup: 'Che cosa succede'},
        'de': {wazzup: 'Wie geht\'s'} }
    });

    should.equal(i18n.getLocales().sort().join(','), ['de', 'en', 'it'].join(','));
    should.equal(i18n.willUpdateFiles(), false);
    should.equal(i18n.__('wazzup'), 'What\'s up');
    i18n.setLocale('it');
    should.equal(i18n.__('wazzup'), 'Che cosa succede');
  });
});
