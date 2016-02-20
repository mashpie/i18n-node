describe('parsing plurals from strings', function() {

  var i18n = require('../i18n'),
    should = require("should");

  // reserve a "private" scope
  var pluralTest = {};

  beforeEach(function() {
    i18n.configure({
      locales: ['en', 'de'],
      directory: './locales',
      register: pluralTest,
      updateFiles: false
    });
    i18n.setLocale(pluralTest, 'en');
  });

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
    should.equal(
      pluralTest.__n('plurals with intervals as string', 2),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n('plurals with intervals as string', 5),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n('plurals with intervals as string', 3),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n('plurals with intervals as string', 6),
      "and a catchall rule"
    );
  });

  it('returns correctly for 2 and 5 and included 3 in mixed order', function() {
    should.equal(
      pluralTest.__n('plurals in any order', 2),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n('plurals in any order', 5),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n('plurals in any order', 3),
      "two to five (included)"
    );
    should.equal(
      pluralTest.__n('plurals in any order', 6),
      "and a catchall rule"
    );
  });

  it('returns correctly catchall for 2 and 5 when excluded and an included 3', function() {
    should.equal(
      pluralTest.__n('plurals with intervals as string (excluded)', 2),
      "and a catchall rule"
    );
    should.equal(
      pluralTest.__n('plurals with intervals as string (excluded)', 5),
      "and a catchall rule"
    );
    should.equal(
      pluralTest.__n('plurals with intervals as string (excluded)', 3),
      "two to five (excluded)"
    );
    should.equal(
      pluralTest.__n('plurals with intervals as string (excluded)', 6),
      "and a catchall rule"
    );
  });

});