var i18n = require('../i18n'),
  should = require("should"),
  fs = require('fs'),
  path = require('path'),
  extensions = require('./extensions'),
  yaml = require('js-yaml');

  var directory = './localestowrite';

extensions.forEach(function(extension) {

  function getData(l) {
    switch(extension) {
      case '.yml':
        return yaml.safeLoad(fs.readFileSync(directory + '/' + l + extension));
        break;
      default:
        return JSON.parse(fs.readFileSync(directory + '/' + l + extension));
    }
  }

  function putData(l, d) {
    var data;
    switch(extension) {
      case '.yml':
        data = yaml.safeDump(d, {indent: '\t'});
        break
      default:
        data = JSON.stringify(d, null, '\t');
    }
    fs.writeFileSync(directory + '/' + l + extension, data);
  }

  describe('when i18n gets a new phrase use '+extension, function() {

    var TestScope = {};
    var locales = ['en', 'de', 'fr', 'ru'];

    beforeEach(function() {
      TestScope = {};
      i18n.configure({
        locales: locales,
        register: TestScope,
        directory: directory,
        updateFiles: true,
        syncFiles: true,
        objectNotation: true,
        extension: extension
      });
      TestScope.setLocale('en');
    });

    it('should get written to all files with __()', function(done) {
      TestScope.__('Hello World');
      should.deepEqual(getData('en')['Hello World'], 'Hello World');
      should.deepEqual(getData('de')['Hello World'], 'Hello World');
      should.deepEqual(getData('fr')['Hello World'], 'Hello World');
      should.deepEqual(getData('ru')['Hello World'], 'Hello World');
      done();
    });

    it('is possible to manually add a translation', function(done) {
      var german = getData('de');
      german['car'] = 'Auto';
      putData('de', german);
      should.deepEqual(getData('de')['car'], 'Auto');
      done();
    });

    it('should not alter any given translation with __()', function(done) {
      TestScope.__('car');
      should.deepEqual(getData('en')['car'], 'car');
      should.deepEqual(getData('de')['car'], 'Auto');
      should.deepEqual(getData('fr')['car'], 'car');
      should.deepEqual(getData('ru')['car'], 'car');
      done();
    });

    it('should get written to all files with __n()', function(done) {
      TestScope.__n('%s cat', '%s cats', 3);
      should.deepEqual(getData('en')['%s cat'], { one: '%s cat', other: '%s cats' });
      should.deepEqual(getData('de')['%s cat'], { one: '%s cat', other: '%s cats' });
      should.deepEqual(getData('fr')['%s cat'], { one: '%s cat', other: '%s cats' });
      should.deepEqual(getData('ru')['%s cat'], { one: '%s cat', other: '%s cats' });
      done();
    });

    it('should get written to all files with __n() - short signature', function(done) {
      TestScope.__n('%s dog', 3);
      should.deepEqual(getData('en')['%s dog'], { one: '%s dog', other: '%s dog' });
      should.deepEqual(getData('de')['%s dog'], { one: '%s dog', other: '%s dog' });
      should.deepEqual(getData('fr')['%s dog'], { one: '%s dog', other: '%s dog' });
      should.deepEqual(getData('ru')['%s dog'], { one: '%s dog', other: '%s dog' });
      done();
    });

    it('should work with dotnotaction by use of __()', function(done) {
      TestScope.__('some.deeper.example');
      should.deepEqual(getData('en').some.deeper, { example: 'some.deeper.example' });
      should.deepEqual(getData('de').some.deeper, { example: 'some.deeper.example' });
      should.deepEqual(getData('fr').some.deeper, { example: 'some.deeper.example' });
      should.deepEqual(getData('ru').some.deeper, { example: 'some.deeper.example' });
      done();
    });

    it('should add subnodes to dotnotaction by use of __()', function(done) {
      TestScope.__('some.other.example:with defaults');
      var expected = {
        deeper: { example: 'some.deeper.example' },
        other: { example: 'with defaults' }
      };
      should.deepEqual(getData('en').some, expected);
      should.deepEqual(getData('de').some, expected);
      should.deepEqual(getData('fr').some, expected);
      should.deepEqual(getData('ru').some, expected);
      done();
    });

    it('should add translations with dotnotaction by use of __n()', function(done) {
      TestScope.__n('example.nested.plurals:%s kitty', 'example.for.plurals:%s kitties', 2);
      var expected = { one: '%s kitty', other: '%s kitties' };
      should.deepEqual(getData('en').example.nested.plurals, expected);
      should.deepEqual(getData('de').example.nested.plurals, expected);
      should.deepEqual(getData('fr').example.nested.plurals, expected);
      should.deepEqual(getData('ru').example.nested.plurals, expected);
      done();
    });

    it('should add translations with dotnotaction by use of __n()', function(done) {
      TestScope.__n('example.single.plurals:%s kitty', 2);
      var expected = { one: '%s kitty', other: '%s kitty' };
      should.deepEqual(getData('en').example.single.plurals, expected);
      should.deepEqual(getData('de').example.single.plurals, expected);
      should.deepEqual(getData('fr').example.single.plurals, expected);
      should.deepEqual(getData('ru').example.single.plurals, expected);
      done();
    });

    it('should add translations with messageformat by use of __mf()', function(done) {
      var msg = 'In {language} there {N, plural,';
      msg += 'zero{are zero for # }';
      msg += 'one{is one for # }';
      msg += 'two{is two for # }';
      msg += 'few{are a few for # }';
      msg += 'many{are many for # }';
      msg += 'other{others for # }';
      msg += '}';

      // this should just add that string
      TestScope.__mf(msg, {N: 1});

      should.deepEqual(getData('en')[msg], msg);
      should.deepEqual(getData('de')[msg], msg);
      should.deepEqual(getData('fr')[msg], msg);
      should.deepEqual(getData('ru')[msg], msg);
      done();
    });

  });
});
