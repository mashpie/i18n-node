var i18n = require('../i18n'),
  should = require("should");

describe('staticCatalog configuration', function() {

  it('should take locales from static catalog if set', function(done) {
    i18n.configure({
      staticCatalog: {
        'en': {}
      }
    });

    var expected = ['en'].sort();
    should.deepEqual(i18n.getLocales(), expected);

    done();
  });

  it('should use static locale definitions from static catalog if set', function(done) {
    i18n.configure({
      staticCatalog: {
        'en': {}
      }
    });

    var expected = new Object();
    should.deepEqual(i18n.getCatalog('en'), expected);

    done();
  });

});
