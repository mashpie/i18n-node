var i18n = require('../i18n'),
  should = require("should");

// reserve a "private" scope
var pluralTest = {};
i18n.configure({
  locales: ['en', 'de'],
  directory: './locales',
  register: pluralTest,
  updateFiles: false,
  objectNotation: true
});
i18n.setLocale(pluralTest, 'en');

describe('parsing plural intervals from strings', function() {

  it('should work with classic format too', function() {
    should.equal(
      "There are 3 monkeys in the tree",
      pluralTest.__n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, 'tree')
    );
    should.equal(
      "There is one monkey in the tree",
      pluralTest.__n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, 'tree')
    );
  });

  // @todo: recheck for writing those
  it('should work with short signature', function() {
    should.equal(
      pluralTest.__n('There is one monkey in the tree', 3),
      "There are 3 monkeys in the tree"
    );
    should.equal(
      pluralTest.__n('There is one monkey in the tree', 1),
      "There is one monkey in the tree"
    );
  });

  it('returns correctly for one', function() {
    should.equal(
      pluralTest.__n('plurals with intervals as string', 1),
      "The default 'one' rule"
    );
  });

  it('returns correctly for zero', function() {
    should.equal(
      pluralTest.__n('plurals with intervals as string', 0),
      "a zero rule"
    );
  });

  it('plurals with intervals in string (no object)', function() {
    var p = 'plurals with intervals in string (no object)';
    should.equal(
      pluralTest.__n(p, 2),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 5),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 3),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 6),
      "and a catchall rule"
    );
  });

  it('plurals with intervals in _other_ missing _one_', function() {
    var p = 'plurals with intervals in _other_ missing _one_';
    should.equal(
      pluralTest.__n(p, 2),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 5),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 3),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 6),
      "and a catchall rule"
    );
  });

  it('returns correctly for 2 and 5 and included 3', function() {
    var p = 'plurals with intervals as string';
    should.equal(
      pluralTest.__n(p, 2),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 5),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 3),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 6),
      "and a catchall rule"
    );
  });

  it('returns correctly for 2 and 5 and included 3 in mixed order', function() {
    var p = 'plurals in any order';
    should.equal(
      pluralTest.__n(p, 2),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 5),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 3),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 6),
      "and a catchall rule"
    );
  });

  it('returns correctly catchall for 2 and 5 when excluded and an included 3', function() {
    var p = 'plurals with intervals as string (excluded)';
    should.equal(
      pluralTest.__n(p, 2),
      "and a catchall rule"
    );
    should.equal(
      pluralTest.__n(p, 5),
      "and a catchall rule"
    );
    should.equal(
      pluralTest.__n(p, 3),
      "two to five (excluded)"
    );
    should.equal(
      pluralTest.__n(p, 6),
      "and a catchall rule"
    );
  });

  it('supports infinity in ranges [0,]', function() {
    var p = 'plurals to eternity';
    should.equal(
      pluralTest.__n(p, 0),
      "this will last forever"
    );
    should.equal(
      pluralTest.__n(p, 2),
      "this will last forever"
    );
    should.equal(
      pluralTest.__n(p, 2000),
      "this will last forever"
    );
    should.equal(
      pluralTest.__n(p, -1),
      "but only gt 0"
    );
  });

  it('supports infinity in ranges [,0]', function() {
    var p = 'plurals from eternity';
    should.equal(
      pluralTest.__n(p, 0),
      "this was born long before"
    );
    should.equal(
      pluralTest.__n(p, -2),
      "this was born long before"
    );
    should.equal(
      pluralTest.__n(p, -2000),
      "this was born long before"
    );
    should.equal(
      pluralTest.__n(p, 1),
      "but only lt 0"
    );
  });

  it('returns correctly for nested plurals', function() {
    var p = 'greeting.plurals';
    should.equal(
      pluralTest.__n(p, 1),
      "The default 'one' rule"
    );
    should.equal(
      pluralTest.__n(p, 2),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 5),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 3),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 6),
      "and a catchall rule"
    );
  });

  it('returns correctly for extra deep nested plurals', function() {
    var p = 'another.nested.extra.deep.example';
    should.equal(
      pluralTest.__(p),
      "The default 'one' rule"
    );
    should.equal(
      pluralTest.__n(p, 1),
      "The default 'one' rule"
    );
    should.equal(
      pluralTest.__n(p, 2),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 5),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 3),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 6),
      "and a catchall rule"
    );
  });

  it('returns correctly for incomplete nested plurals', function() {
    var p = 'another.nested.extra.lazy.example';

    should.equal(
      pluralTest.__(p),
      "and a catchall rule"
    );
    should.equal(
      pluralTest.__n(p, 1),
      "and a catchall rule"
    );
    should.equal(
      pluralTest.__n(p, 2),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 5),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 3),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n(p, 6),
      "and a catchall rule"
    );
  });

  it('returns correctly for nested mustache plurals', function() {
    var p = 'another.nested.extra.mustache.example';

    should.equal(
      pluralTest.__(p, { me: 'marcus' }),
      "and a catchall rule for marcus"
    );
    should.equal(
      pluralTest.__n(p, 1, { me: 'marcus' }),
      "and a catchall rule for marcus"
    );
    should.equal(
      pluralTest.__n(p, 2, { me: 'marcus' }),
      "two to five (included) for marcus"
    );
    should.equal(
      pluralTest.__n(p, 5, { me: 'marcus' }),
      "two to five (included) for marcus"
    );
    should.equal(
      pluralTest.__n(p, 3, { me: 'marcus' }),
      "two to five (included) for marcus"
    );
    should.equal(
      pluralTest.__n(p, 6, { me: 'marcus' }),
      "and a catchall rule for marcus"
    );
  });

  it('returns correctly for nested mustache plurals with sprintf', function() {
    var p = 'another.nested.extra.mustacheprintf.example';

    should.equal(
      pluralTest.__(p, { me: 'marcus' }),
      "and a catchall rule for marcus to get my number %s"
    );
    should.equal(
      pluralTest.__(p, ['one'], { me: 'marcus' }),
      "and a catchall rule for marcus to get my number one"
    );
    should.equal(
      pluralTest.__n(p, 1, { me: 'marcus' }),
      "and a catchall rule for marcus to get my number 1"
    );
    should.equal(
      pluralTest.__n(p, 2, { me: 'marcus' }),
      "2 is between two and five (included) for marcus"
    );
    should.equal(
      pluralTest.__n(p, 5, { me: 'marcus' }),
      "5 is between two and five (included) for marcus"
    );
    should.equal(
      pluralTest.__n(p, 3, { me: 'marcus' }),
      "3 is between two and five (included) for marcus"
    );
    should.equal(
      pluralTest.__n(p, 6, { me: 'marcus' }),
      "and a catchall rule for marcus to get my number 6"
    );
  });

  it('should resolve "Simpler dot notation for plurals #177"', function() {

    should.equal(
      pluralTest.__n('cats.n', 1),
      '1 cat'
    );

    should.equal(
      pluralTest.__n('cats.n', 2),
      '2 cats'
    );

    should.equal(
      pluralTest.__n('cats.n', 0),
      '0 cats'
    );

  });

});