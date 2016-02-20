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

  // // @todo: recheck for writing those
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

});