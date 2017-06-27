var i18n = require('../i18n'),
  should = require('should'),
  fs = require('fs'),
  path = require('path');

var reset = function() {
  i18n.configure({
    locales: ['en'],
    directory: './locales',
    multiDirectories: false
  });
}

describe('Module API', function() {

  beforeEach(function() {

    i18n.configure({
      locales: ['en', 'de'],
      fallbacks: { 'nl': 'de' },
      directory: './locales',
      register: global,
      multiDirectories: true
    });

    i18n.configure({
      directory: './secondLocales',
      dirName: 'secondLocales',
      locales: ['fr']
    });

  });

  describe('Global Scope', function() {

    describe('i18nGetCatalog', function() {
      it('should return all catalogs when invoked with empty parameters', function() {
        var catalogs = i18n.getCatalog();
        catalogs.should.have.property('en');
        catalogs.en.should.have.property('Hello', 'Hello');
        catalogs.should.have.property('de');
        catalogs.de.should.have.property('Hello', 'Hallo');
        catalogs.should.have.property('fr');
        catalogs.fr.should.have.property('Hello', 'Bonjour');
      });
      it('should return just the EN catalog when invoked with "en" as parameter', function() {
        i18n.getCatalog('en').should.have.property('Hello', 'Hello');
      });
      it('should return just the FR catalog when invoked with "fr" as parameter', function() {
        i18n.getCatalog('fr').should.have.property('Hello', 'Bonjour');
      });
      it('should return just the DE catalog when invoked with a (fallback) "nl" as parameter', function() {
        i18n.getCatalog('nl').should.have.property('Hello', 'Hallo');
      });
      it('should return false when invoked with unsupported locale as parameter', function() {
        i18n.getCatalog('oO').should.equal(false);
      });
    });

    describe('i18nTranslate', function() {
      it('should return en translations as expected', function() {
        i18n.setLocale('en');
        should.equal(__('Hello'), 'Hello');
        should.equal(__('Hello %s, how are you today?', 'Marcus'),
          'Hello Marcus, how are you today?');
        should.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')),
          'Hello Marcus, how are you today? How was your weekend.');
      });

      it('should return fr translations as expected', function() {
        i18n.setLocale('fr');
        should.equal(__('Hello', 'secondLocales'), 'Bonjour');
        should.equal(__('Hello %s, how are you today?', 'Marcus', 'secondLocales'),
          'Bonjour Marcus, comment allez-vous aujourd\'hui?');
        should.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend'), 'secondLocales'),
          'Bonjour Marcus, comment allez-vous aujourd\'hui ? Comment était votre week-end.');
      });

      it('should return en translations as expected, using mustached messages', function() {
        i18n.setLocale('fr');
        should.equal(__('Hello {{name}}', { name: 'Marcus' }, 'secondLocales'),
          'Bonjour Marcus');
        should.equal(__('Hello {{name}}, how was your %s?', __('weekend'), { name: 'Marcus' }, 'secondLocales'),
          'Bonjour Marcus, comment était votre week-end?');
      });
      it('should return fr translations as expected, using mustached messages', function() {
        i18n.setLocale('fr');
        // named only
        should.equal(__('Hello {{name}}', { name: 'Marcus' }, 'secondLocales'), 'Bonjour Marcus');
        // named + sprintf
        should.equal(__('Hello {{name}}, how was your %s?', __('weekend'), { name: 'Marcus' }, 'secondLocales'),
          'Bonjour Marcus, comment était votre week-end?');
        // nested
        should.equal(__(__('Hello {{name}}, how was your %s?', { name: 'Marcus' }, 'secondLocales'),
          __('weekend'), 'secondLocales'),
          'Bonjour Marcus, comment était votre week-end?');
      });

      it('simple translation should work on global', function() {
        i18n.setLocale('en');
        should.equal(__('Hello'), 'Hello');
        i18n.setLocale('fr');
        should.equal(__('Hello', 'secondLocales'), 'Bonjour');
      });

      it('should also return translations when iterating thru variables values', function() {
        var i = 0,
        greetings = ['Hi', 'Hello', 'Howdy'],
        greetingsFR = ['Salut', 'Bonjour', 'Salut'];

        i18n.setLocale('en');
        for (i = 0; i < greetings.length; i++) {
          should.equal(greetings[i], __(greetings[i]));
        }

        i18n.setLocale('fr');
        for (i = 0; i < greetings.length; i++) {
          should.equal(greetingsFR[i], __(greetings[i], 'secondLocales'));
        }
      });

      it('should be possible to use an json object as 1st parameter to specifiy a certain locale for that lookup',
        function() {
          should.equal(__({phrase: "Hello", locale: "en"}), 'Hello');
          should.equal(__({phrase: "Hello", locale: "fr"}, 'secondLocales'), 'Bonjour');
          should.equal(__({locale: "fr", phrase: "Hello"}, 'secondLocales'), 'Bonjour');
          // passing specific locale
          should.equal(__({ phrase: 'Hello', locale: 'fr' }, 'secondLocales'), 'Bonjour');
          should.equal(__({ phrase: 'Hello %s', locale: 'fr' }, 'Marcus', 'secondLocales'), 'Bonjour Marcus');
        });
    });

    describe('i18nTranslatePlural', function() {
      it('should return singular or plural form based on last parameter', function() {
        i18n.setLocale('en');
        var singular = __n('%s cat', '%s cats', 1),
        plural = __n('%s cat', '%s cats', 3);
        should.equal(singular, '1 cat');
        should.equal(plural, '3 cats');

        i18n.setLocale('fr');
        singular = __n('%s cat', '%s cats', 1, 'secondLocales');
        plural = __n('%s cat', '%s cats', 3, 'secondLocales');
        should.equal(singular, '1 chat');
        should.equal(plural, '3 chats');
      });

      it('should return substituted phrases when used nested', function() {
        i18n.setLocale('en');
        var singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, __('tree')),
        plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, __('tree'));
        should.equal(singular, 'There is one monkey in the tree');
        should.equal(plural, 'There are 3 monkeys in the tree');

        i18n.setLocale('fr');
        singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, __('tree'));
        plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, __('tree'));
        should.equal(singular, 'Il y a un singe sur l\'arbre');
        should.equal(plural, 'Il y a 3 singes sur l\'arbre');
      });

      it('won\'t return substitutions when not masked by an extra % (%% issue #49)', function() {
        i18n.setLocale('en');
        var singular = __n('There is one monkey in the %s', 'There are %d monkeys in the %s', 1, __('tree')),
        plural = __n('There is one monkey in the %s', 'There are %d monkeys in the %s', 3, __('tree'));
        should.equal(singular, 'There is one monkey in the 1');
        should.equal(plural, 'There are 3 monkeys in the undefined');

        i18n.setLocale('fr');
        singular = __n('There is one monkey in the %s', 'There are %d monkeys in the %s', 1, __('tree'), 'secondLocales');
        plural = __n('There is one monkey in the %s', 'There are %d monkeys in the %s', 3, __('tree'), 'secondLocales');
        should.equal(singular, 'There is one monkey in the 1');
        should.equal(plural, 'There are 3 monkeys in the undefined');
      });

      it('should be possible to use an json object as 1st parameter to specifiy a certain locale for that lookup',
        function() {
          var singular, plural;

          i18n.setLocale('en');
          singular = __n({ singular: "%s cat", plural: "%s cats", locale: "fr" }, 1, 'secondLocales');
          plural = __n({ singular: "%s cat", plural: "%s cats", locale: "fr" }, 3, 'secondLocales');
          should.equal(singular, '1 chat');
          should.equal(plural, '3 chats');

          singular = __n({ singular: "%s cat", plural: "%s cats", locale: "fr", count: 1 }, 'secondLocales');
          plural = __n({ singular: "%s cat", plural: "%s cats", locale: "fr", count: 3 }, 'secondLocales');
          should.equal(singular, '1 chat');
          should.equal(plural, '3 chats');

          singular = __n({ singular: "%s cat", plural: "%s cats", locale: "fr", count: "1" }, 'secondLocales');
          plural = __n({ singular: "%s cat", plural: "%s cats", locale: "fr", count: "3" }, 'secondLocales');
          should.equal(singular, '1 chat');
          should.equal(plural, '3 chats');

        });

      it('should allow two arguments', function() {
        i18n.setLocale('fr');
        var singular = __n("cat", 1, 'secondLocales');
        var plural = __n("cat", 3, 'secondLocales');
        should.equal(singular, '1 chat');
        should.equal(plural, '3 chats');
        i18n.setLocale('en');
      });
    });
  });
});

reset();
/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

describe('Module API', function () {

  beforeEach(function() {

    i18n.configure({
      locales: ['en'],
      directory: './locales',
      multiDirectories: true
    });

    i18n.configure({
      directory: './secondLocales',
      dirName: 'secondLocales',
      locales: ['fr'],
      fallbacks: {'fra': 'fr'}
    });

  });

  describe('Local Scope', function () {
    var req = {
      request: "GET /test",
      __: i18n.__,
      __n: i18n.__n,
      locale: {},
      headers: {}
    };

    beforeEach(function() {
      reset();
      i18n.configure({
        locales: ['en', 'en-GB'],
        defaultLocale: 'en',
        directory: './locales',
        register: req,
        multiDirectories: true
      });

      i18n.configure({
        directory: './secondLocales',
        dirName: 'secondLocales',
        locales: ['fr'],
        fallbacks: {'fra': 'fr'},
      });

    });

    describe('i18nInit', function() {
      beforeEach(function() {
        req.headers = {};
        delete req.languages;
        delete req.language;
        delete req.locale;
        delete req.region;
        delete req.regions;
      });

      it('should set language to first-choice language from header when first choice is available', function() {
        req.headers['accept-language'] = 'fr,en;q=0.8';
        i18n.init(req);
        i18n.getLocale(req).should.equal('fr');
      });
    });

    describe('Object as parameter', function () {
      describe('i18nSetLocale and i18nGetLocale', function () {
        beforeEach(function() {
          i18n.setLocale('en');
        });
        afterEach(function() {
          i18n.setLocale('en');
        });
        it('should return the current local setting, when used with 2 args', function () {
          i18n.setLocale(req, 'fr').should.equal('fr');
        });
        it('while getLocale should still return the previous global setting', function () {
          i18n.setLocale(req, 'fr');
          i18n.getLocale().should.equal('en');
        });
        it('now getLocale should return local locale when used with local object as 1st arg', function () {
          i18n.setLocale(req, 'fr');
          i18n.getLocale(req).should.equal('fr');
        });
        it('should return the default local setting, when used with 2 args and an unsupported local, when req.locale is undefined', function() {
          i18n.setLocale(req, 'rf').should.equal('en');
          req.locale.should.equal('en');
        });
        it('should return the default local setting, when req.locale is undefined', function() {
          req.locale = undefined;
          i18n.setLocale(req, 'fr').should.equal('fr');
          req.locale.should.equal('fr');
        });
      });
      describe('i18nGetCatalog', function () {
        it('should return the current catalog when invoked with empty parameters', function () {
          i18n.setLocale(req, 'en');
          i18n.getCatalog(req).should.have.property('Hello', 'Hello');
        });
        it('should return just the FR catalog when invoked with "fr" as parameter', function () {
          i18n.getCatalog(req, 'fr').should.have.property('Hello', 'Bonjour');
        });
        it('should return false when invoked with unsupported locale as parameter', function () {
          i18n.getCatalog(req, 'oO').should.equal(false);
        });
      });
      describe('i18nGetLocales', function () {
        it('should return the locales', function () {
          var returnedLocales = i18n.getLocales();
          returnedLocales.sort();
          var expectedLocales = ['en', 'fr', 'en-GB'];
          expectedLocales.sort();
          returnedLocales.length.should.equal(expectedLocales.length);

          for (var i = 0; i < returnedLocales.length; i++) {
            returnedLocales[i].should.equal(expectedLocales[i]);
          }
        });
      });
      describe('i18nTranslate', function () {
        beforeEach(function() {
          i18n.setLocale('fr');
        });
        afterEach(function() {
          i18n.setLocale('en');
        });
        it('has to use local translation in en', function (done) {
          i18n.setLocale(req, 'en').should.equal('en');
          req.__('Hello').should.equal('Hello');
          done();
        });
        it('while the global translation remains untouched', function (done) {
          i18n.setLocale(req, 'fr');
          should.equal(__('Hello', 'secondLocales'), 'Hello');
          should.equal(req.__('Hello', 'secondLocales'), 'Bonjour');
          done();
        });
        it('and has to use local translation in fr', function (done) {
          i18n.setLocale(req, 'fr').should.equal('fr');
          req.__('Hello', 'secondLocales').should.equal('Bonjour');
          done();
        });
        it('still the global translation remains untouched', function (done) {
          i18n.setLocale(req, 'fr');
          should.equal(__('Hello', 'secondLocales'), 'Hello');
          should.equal(req.__('Hello', 'secondLocales'), 'Bonjour');
          done();
        });
        it('should be possible to use an json object as 1st parameter to specifiy a certain locale for that lookup',
          function () {
            i18n.setLocale(req, 'en').should.equal('en');
            should.equal(req.__({phrase: "Hello", locale: "en"}), 'Hello');
            should.equal(req.__({phrase: "Hello", locale: "fr"}, 'secondLocales'), 'Bonjour');
            should.equal(req.__({locale: "en", phrase: "Hello"}), 'Hello');
            should.equal(req.__({locale: "fr", phrase: "Hello"}, 'secondLocales'), 'Bonjour');
            req.__('Hello', 'secondLocales').should.equal('Hello');

            i18n.setLocale(req, 'fr').should.equal('fr');
            should.equal(req.__({phrase: "Hello", locale: "en"}), 'Hello');
            should.equal(req.__({phrase: "Hello", locale: "fr"}, 'secondLocales'), 'Bonjour');
            should.equal(req.__({locale: "en", phrase: "Hello"}), 'Hello');
            should.equal(req.__({locale: "fr", phrase: "Hello"}, 'secondLocales'), 'Bonjour');
            req.__('Hello', 'secondLocales').should.equal('Bonjour');
          });
      });
    });

    describe('Attached to object', function () {
      describe('i18nSetLocale and i18nGetLocale', function () {
        beforeEach(function() {
          i18n.setLocale('fr');
        });
        afterEach(function() {
          i18n.setLocale('en');
        });
        it('should return the current local setting, when used with 1 arg', function () {
          req.setLocale('en').should.equal('en');
        });
        it('while getLocale should still return the previous global setting', function () {
          req.setLocale('en');
          i18n.getLocale().should.equal('fr');
        });
        it('now getLocale should return local locale', function () {
          req.setLocale('en');
          req.getLocale().should.equal('en');
        });
      });
      describe('i18nGetCatalog', function () {
        it('should return the current catalog when invoked with empty parameters', function () {
          req.setLocale('en');
          req.getCatalog().should.have.property('Hello', 'Hello');
        });
        it('should return just the FR catalog when invoked with "fr" as parameter', function () {
          req.getCatalog('fr').should.have.property('Hello', 'Bonjour');
        });
        it('should return false when invoked with unsupported locale as parameter', function () {
          req.getCatalog('oO').should.equal(false);
        });
      });
    });

    describe('i18nTranslatePlural', function () {
      it('should return singular or plural form based on last parameter', function () {
        i18n.setLocale(req, 'fr');
        singular = req.__n('%s cat', '%s cats', 1, 'secondLocales');
        plural = req.__n('%s cat', '%s cats', 3, 'secondLocales');
        should.equal(singular, '1 chat');
        should.equal(plural, '3 chats');
      });
    });
  });
});

reset();

describe('Module Defaults', function() {

  var testScope = {};

  beforeEach(function() {
    reset();
    i18n.configure({
      locales: ['en'],
      register: testScope,
      directory: './defaultlocales',
      multiDirectories: true,
    });
    i18n.configure({
      directory: './addedlocales',
      dirName: 'addedlocales',
      locales: ['fr'],
      fallbacks: {'fra': 'fr'}
    });
    testScope.__('Hello');
  });

  afterEach(function() {
    var stats = fs.lstatSync('./defaultlocales');
    should.exist(stats);
    if (stats) {
      try {
        fs.unlinkSync('./defaultlocales/de.json');
        fs.rmdirSync('./defaultlocales');
      } catch (e) {}
    }
    stats = fs.lstatSync('./addedlocales');
    should.exist(stats);
    if (stats) {
      try {
        fs.unlinkSync('./addedlocales/fr.json');
        fs.rmdirSync('./addedlocales');
      } catch (e) {}
    }
  });

  it('should be possible to setup a custom directory', function() {
    var stats = fs.lstatSync('./defaultlocales');
    should.exist(stats);
    var stats = fs.lstatSync('./addedlocales');
    should.exist(stats);
  });

  it('should be possible to read custom files with default a extension of .json (issue #16)', function() {
    var statsfr = fs.lstatSync('./addedlocales/fr.json'),
    statsen = fs.lstatSync('./defaultlocales/en.json');
    should.exist(statsfr);
    should.exist(statsen);
  });
});

reset();

describe('Fallbacks', function() {
  var req = {
    request: "GET /test",
    __: i18n.__,
    __n: i18n.__n,
    locale: {},
    headers: {}
  };

  describe('Fallback to language', function() {
    beforeEach(function() {

      i18n.configure({
        locales: ['en'],
        defaultLocale: 'en',
        directory: './locales',
        register: req,
        multiDirectories: true
      });
      i18n.configure({
        directory: './secondLocales',
        dirName: 'secondLocales',
        locales: ['fr'],
        fallbacks: {'fra': 'fr'}
      });

      req.headers = {};
      delete req.languages;
      delete req.language;
      delete req.locale;
      delete req.region;
      delete req.regions;
    });

    it('should fall back to "fr" for language "fra"', function() {
      req.headers['accept-language'] = 'fra';
      i18n.init(req);
      i18n.getLocale(req).should.equal('fr');
    });
    it('should fall back to "fr" for language "fra-BAR"', function() {
      req.headers['accept-language'] = 'fra-BAR';
      i18n.init(req);
      i18n.getLocale(req).should.equal('fr');
    });
  });
});

reset();

var directory = './localestowrite';
var secondDirectory = './secondlocalestowrite';

function getJson(l) {
  return JSON.parse(fs.readFileSync(directory + '/' + l + '.json'));
}

function putJson(l, d) {
  fs.writeFileSync(directory + '/' + l + '.json', JSON.stringify(d, null, '\t'));
}

function getJson2(l) {
  return JSON.parse(fs.readFileSync(secondDirectory + '/' + l + '.json'));
}

function putJson2(l, d) {
  fs.writeFileSync(secondDirectory + '/' + l + '.json', JSON.stringify(d, null, '\t'));
}

describe('when i18n gets a new phrase', function() {

  var TestScope = {};
  var locales = ['en', 'de'];

  beforeEach(function() {
    reset();
    TestScope = {};
    i18n.configure({
      locales: locales,
      register: TestScope,
      directory: directory,
      updateFiles: true,
      syncFiles: true,
      objectNotation: true,
      multiDirectories: true
    });
    i18n.configure({
      directory: './secondlocalestowrite',
      dirName: 'locales2',
      locales: ['fr', 'ru'],
    });
    TestScope.setLocale('en');
  });

  it('should get written to all files with __()', function(done) {
    TestScope.__('Hello World');
    should.deepEqual(getJson('en')['Hello World'], 'Hello World');
    should.deepEqual(getJson('de')['Hello World'], 'Hello World');
    done();
    TestScope.__('Hello World', 'locales2');
    should.deepEqual(getJson2('fr')['Hello World'], 'Hello World');
    should.deepEqual(getJson2('ru')['Hello World'], 'Hello World');
    done();
  });

  it('is possible to manually add a translation', function(done) {
    var german = getJson('de');
    german['car'] = 'Auto';
    putJson('de', german);
    should.deepEqual(getJson('de')['car'], 'Auto');
    done();
  });

  it('should not alter any given translation with __()', function(done) {
    TestScope.__('car');
    should.deepEqual(getJson('en')['car'], 'car');
    should.deepEqual(getJson('de')['car'], 'Auto');
    done();
    TestScope.__('car', 'locales2');
    should.deepEqual(getJson2('fr')['car'], 'car');
    should.deepEqual(getJson2('ru')['car'], 'car');
    done();
  });

  it('should get written to all files with __n()', function(done) {
    TestScope.__n('%s cat', '%s cats', 3);
    should.deepEqual(getJson('en')['%s cat'], { one: '%s cat', other: '%s cats' });
    should.deepEqual(getJson('de')['%s cat'], { one: '%s cat', other: '%s cats' });
    done();
    TestScope.__n('%s cat', '%s cats', 3, 'locales2');
    should.deepEqual(getJson2('fr')['%s cat'], { one: '%s cat', other: '%s cats' });
    should.deepEqual(getJson2('ru')['%s cat'], { one: '%s cat', other: '%s cats' });
    done();
  });

  it('should get written to all files with __n() - short signature', function(done) {
    TestScope.__n('%s dog', 3);
    should.deepEqual(getJson('en')['%s dog'], { one: '%s dog', other: '%s dog' });
    should.deepEqual(getJson('de')['%s dog'], { one: '%s dog', other: '%s dog' });
    done();
    TestScope.__n('%s dog', 3, 'locales2');
    should.deepEqual(getJson2('fr')['%s dog'], { one: '%s dog', other: '%s dog' });
    should.deepEqual(getJson2('ru')['%s dog'], { one: '%s dog', other: '%s dog' });
    done();
  });

  it('should work with dotnotaction by use of __()', function(done) {
    TestScope.__('some.deeper.example');
    should.deepEqual(getJson('en').some.deeper, { example: 'some.deeper.example' });
    should.deepEqual(getJson('de').some.deeper, { example: 'some.deeper.example' });
    done();
    TestScope.__('some.deeper.example', 'locales2');
    should.deepEqual(getJson2('fr').some.deeper, { example: 'some.deeper.example' });
    should.deepEqual(getJson2('ru').some.deeper, { example: 'some.deeper.example' });
    done();
  });

  it('should add subnodes to dotnotaction by use of __()', function(done) {
    TestScope.__('some.other.example:with defaults');
    var expected = {
      deeper: { example: 'some.deeper.example' },
      other: { example: 'with defaults' }
    };
    should.deepEqual(getJson('en').some, expected);
    should.deepEqual(getJson('de').some, expected);
    done();
    TestScope.__('some.other.example:with defaults', 'locales2');
    should.deepEqual(getJson2('fr').some, expected);
    should.deepEqual(getJson2('ru').some, expected);
    done();
  });

  it('should add translations with dotnotaction by use of __n()', function(done) {
    TestScope.__n('example.nested.plurals:%s kitty', 'example.for.plurals:%s kitties', 2);
    var expected = { one: '%s kitty', other: '%s kitties' };
    should.deepEqual(getJson('en').example.nested.plurals, expected);
    should.deepEqual(getJson('de').example.nested.plurals, expected);
    done();
    TestScope.__n('example.nested.plurals:%s kitty', 'example.for.plurals:%s kitties', 2, 'locales2');
    should.deepEqual(getJson2('fr').example.nested.plurals, expected);
    should.deepEqual(getJson2('ru').example.nested.plurals, expected);
    done();
  });

  it('should add translations with dotnotaction by use of __n()', function(done) {
    TestScope.__n('example.single.plurals:%s kitty', 2);
    var expected = { one: '%s kitty', other: '%s kitty' };
    should.deepEqual(getJson('en').example.single.plurals, expected);
    should.deepEqual(getJson('de').example.single.plurals, expected);
    TestScope.__n('example.single.plurals:%s kitty', 2, 'locales2');
    should.deepEqual(getJson('fr').example.single.plurals, expected);
    should.deepEqual(getJson('ru').example.single.plurals, expected);
    done();
  });
});
