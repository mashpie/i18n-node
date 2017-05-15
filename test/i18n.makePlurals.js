var i18n = require('../i18n'),
  should = require("should"),
  fs = require('fs'),
  path = require('path');

var directory = './localesmakeplural';

function getJson(l) {
  return JSON.parse(fs.readFileSync(directory + '/' + l + '.json'));
}

function putJson(l, d) {
  fs.writeFileSync(directory + '/' + l + '.json', JSON.stringify(d, null, '\t'));
}

describe('i18n supports MakePlural', function() {

  var TestScope = {};
  var locales = ['en', 'de', 'fr', 'ru', 'ar', 'de-DE', 'de-AT', 'de-CH'];
  var fixture = {
    de: {
      "%s cat": {
        one: '%d Katze',
        other: '%d Katzen'
      }
    },
    'de-DE': {
      "%s cat": {
        one: '%d Katze',
        other: '%d Katzen'
      }
    },
    'de-AT': {
      "%s cat": {
        one: '%d Katze',
        other: '%d Katzen'
      }
    },
    'de-CH': {
      "%s cat": {
        one: '%d Katze',
        other: '%d Katzen'
      }
    },
    en: {
      "%s cat": {
        one: '%d cat',
        other: '%d cats'
      }
    },
    fr: {
      "%s cat": {
        one: '%d chat',
        other: '%d chats'
      }
    },
    ru: {
      "%s cat": {
        one: '%d кошка',
        few: '%d кошки',
        many: '%d кошек'
      }
    },
    ar: {
      "%s book": {
        zero: "‫٠ كتاب",
        one: "كتاب",
        two: "كتابان",
        few: "‫٣ كتب",
        many: "‫١١ كتابًا",
        other: "‫١٠٠ كتاب"
      }
    }
  };

  beforeEach(function() {
    TestScope = {};
    i18n.configure({
      locales: locales,
      register: TestScope,
      directory: directory,
      updateFiles: true,
      syncFiles: true,
      objectNotation: true
    });

    TestScope.setLocale('en');
    TestScope.__('Hello World'); // <-- just inits
    for (var i = 0; i < locales.length; i++) {
      putJson(locales[i], fixture[locales[i]]);
    };
  });

  it('A test phrase should have got written to all files', function(done) {
    should.deepEqual(getJson('en')['%s cat'], { one: '%d cat', other: '%d cats' } );
    should.deepEqual(getJson('de')['%s cat'], { one: '%d Katze', other: '%d Katzen' } );
    should.deepEqual(getJson('fr')['%s cat'], { one: '%d chat', other: '%d chats' } );
    should.deepEqual(getJson('ru')['%s cat'], { one: '%d кошка', few: '%d кошки', many: '%d кошек' });
    done();
  });

  it('__n() should return correctly in russian', function(done) {
    TestScope.setLocale('ru');
    should.deepEqual(TestScope.__n('%s cat', 0), '0 кошек');
    should.deepEqual(TestScope.__n('%s cat', 1), '1 кошка');
    should.deepEqual(TestScope.__n('%s cat', 2), '2 кошки');
    should.deepEqual(TestScope.__n('%s cat', 5), '5 кошек');
    should.deepEqual(TestScope.__n('%s cat', 6), '6 кошек');
    should.deepEqual(TestScope.__n('%s cat', 21), '21 кошка');
    done();
  });

  it('__n() should return correctly in french', function(done) {
    TestScope.setLocale('fr');
    should.deepEqual(TestScope.__n('%s cat', 0), '0 chat');
    should.deepEqual(TestScope.__n('%s cat', 1), '1 chat');
    should.deepEqual(TestScope.__n('%s cat', 2), '2 chats');
    should.deepEqual(TestScope.__n('%s cat', 5), '5 chats');
    should.deepEqual(TestScope.__n('%s cat', 6), '6 chats');
    should.deepEqual(TestScope.__n('%s cat', 21), '21 chats');
    done();
  });

  it('__n() should return correctly in german', function(done) {
    TestScope.setLocale('de');
    should.deepEqual(TestScope.__n('%s cat', 0), '0 Katzen');
    should.deepEqual(TestScope.__n('%s cat', 1), '1 Katze');
    should.deepEqual(TestScope.__n('%s cat', 2), '2 Katzen');
    should.deepEqual(TestScope.__n('%s cat', 5), '5 Katzen');
    should.deepEqual(TestScope.__n('%s cat', 6), '6 Katzen');
    should.deepEqual(TestScope.__n('%s cat', 21), '21 Katzen');
    done();
  });

  it('__n() should return correctly in english', function(done) {
    TestScope.setLocale('en');
    should.deepEqual(TestScope.__n('%s cat', 0), '0 cats');
    should.deepEqual(TestScope.__n('%s cat', 1), '1 cat');
    should.deepEqual(TestScope.__n('%s cat', 2), '2 cats');
    should.deepEqual(TestScope.__n('%s cat', 5), '5 cats');
    should.deepEqual(TestScope.__n('%s cat', 6), '6 cats');
    should.deepEqual(TestScope.__n('%s cat', 21), '21 cats');
    done();
  });

  it('__n() should return correctly in arabic', function(done) {
    TestScope.setLocale('ar');
    should.deepEqual(TestScope.__n('%s book', 0), '‫٠ كتاب');
    should.deepEqual(TestScope.__n('%s book', 1), 'كتاب');
    should.deepEqual(TestScope.__n('%s book', 2), 'كتابان');
    should.deepEqual(TestScope.__n('%s book', 3), '‫٣ كتب');
    should.deepEqual(TestScope.__n('%s book', 11), '‫١١ كتابًا');
    should.deepEqual(TestScope.__n('%s book', 100), '‫١٠٠ كتاب');
    TestScope.__n('%s dog', 0);
    TestScope.__n('%s kitty', '%s kittens', 0);
    done();
  });

  it('__n() should return correctly in german for all regions', function(done) {
    var regions = ['de-DE', 'de-AT', 'de-CH'];
    for(var i = 0; i < regions.length; i++) {
      TestScope.setLocale(regions[i]);
      should.deepEqual(TestScope.__n('%s cat', 0), '0 Katzen');
      should.deepEqual(TestScope.__n('%s cat', 1), '1 Katze');
      should.deepEqual(TestScope.__n('%s cat', 2), '2 Katzen');
      should.deepEqual(TestScope.__n('%s cat', 5), '5 Katzen');
      should.deepEqual(TestScope.__n('%s cat', 6), '6 Katzen');
      should.deepEqual(TestScope.__n('%s cat', 21), '21 Katzen');
    }
    done();
  });

});