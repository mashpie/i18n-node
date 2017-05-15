var i18n = require('../i18n'),
  should = require("should"),
  fs = require('fs'),
  path = require('path');

var directory = './localestowrite';

function getJson(l) {
  return JSON.parse(fs.readFileSync(directory + '/' + l + '.json'));
}

function putJson(l, d) {
  fs.writeFileSync(directory + '/' + l + '.json', JSON.stringify(d, null, '\t'));
}

describe('when i18n gets a new phrase', function() {

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
      objectNotation: true
    });
    TestScope.setLocale('en');
  });

  it('should get written to all files with __()', function(done) {
    TestScope.__('Hello World');
    should.deepEqual(getJson('en')['Hello World'], 'Hello World');
    should.deepEqual(getJson('de')['Hello World'], 'Hello World');
    should.deepEqual(getJson('fr')['Hello World'], 'Hello World');
    should.deepEqual(getJson('ru')['Hello World'], 'Hello World');
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
    should.deepEqual(getJson('fr')['car'], 'car');
    should.deepEqual(getJson('ru')['car'], 'car');
    done();
  });

  it('should get written to all files with __n()', function(done) {
    TestScope.__n('%s cat', '%s cats', 3);
    should.deepEqual(getJson('en')['%s cat'], { one: '%s cat', other: '%s cats' });
    should.deepEqual(getJson('de')['%s cat'], { one: '%s cat', other: '%s cats' });
    should.deepEqual(getJson('fr')['%s cat'], { one: '%s cat', other: '%s cats' });
    should.deepEqual(getJson('ru')['%s cat'], { one: '%s cat', other: '%s cats' });
    done();
  });

  it('should get written to all files with __n() - short signature', function(done) {
    TestScope.__n('%s dog', 3);
    should.deepEqual(getJson('en')['%s dog'], { one: '%s dog', other: '%s dog' });
    should.deepEqual(getJson('de')['%s dog'], { one: '%s dog', other: '%s dog' });
    should.deepEqual(getJson('fr')['%s dog'], { one: '%s dog', other: '%s dog' });
    should.deepEqual(getJson('ru')['%s dog'], { one: '%s dog', other: '%s dog' });
    done();
  });

  it('should work with dotnotaction by use of __()', function(done) {
    TestScope.__('some.deeper.example');
    should.deepEqual(getJson('en').some.deeper, { example: 'some.deeper.example' });
    should.deepEqual(getJson('de').some.deeper, { example: 'some.deeper.example' });
    should.deepEqual(getJson('fr').some.deeper, { example: 'some.deeper.example' });
    should.deepEqual(getJson('ru').some.deeper, { example: 'some.deeper.example' });
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
    should.deepEqual(getJson('fr').some, expected);
    should.deepEqual(getJson('ru').some, expected);
    done();
  });

  it('should add translations with dotnotaction by use of __n()', function(done) {
    TestScope.__n('example.nested.plurals:%s kitty', 'example.for.plurals:%s kitties', 2);
    var expected = { one: '%s kitty', other: '%s kitties' };
    should.deepEqual(getJson('en').example.nested.plurals, expected);
    should.deepEqual(getJson('de').example.nested.plurals, expected);
    should.deepEqual(getJson('fr').example.nested.plurals, expected);
    should.deepEqual(getJson('ru').example.nested.plurals, expected);
    done();
  });

  it('should add translations with dotnotaction by use of __n()', function(done) {
    TestScope.__n('example.single.plurals:%s kitty', 2);
    var expected = { one: '%s kitty', other: '%s kitty' };
    should.deepEqual(getJson('en').example.single.plurals, expected);
    should.deepEqual(getJson('de').example.single.plurals, expected);
    should.deepEqual(getJson('fr').example.single.plurals, expected);
    should.deepEqual(getJson('ru').example.single.plurals, expected);
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

    should.deepEqual(getJson('en')[msg], msg);
    should.deepEqual(getJson('de')[msg], msg);
    should.deepEqual(getJson('fr')[msg], msg);
    should.deepEqual(getJson('ru')[msg], msg);
    done();
  });

});