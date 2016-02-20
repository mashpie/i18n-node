var i18n = require('../i18n'),
  should = require("should"),
  fs = require('fs'),
  path = require('path');

var i18nPath = 'i18n';
var i18nFilename = path.resolve(i18nPath + '.js');

function reconfigure(config) {
  delete require.cache[i18nFilename];
  i18n = require(i18nFilename);
  i18n.configure(config);
}

describe('parsing plurals from strings', function() {

  var res = {};
  reconfigure({
    directory: './locales',
    register: res
  });
  res.setLocale('en');

  it('should work with classic format too', function() {
    should.equal(
      "There are 3 monkeys in the tree",
      res.__n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, 'tree')
    );
    should.equal(
      "There is one monkey in the tree",
      res.__n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, 'tree')
    );
  });

  // @todo: recheck for writing those
  it('should work with short signature', function() {
    should.equal(
      "There are 3 monkeys in the tree",
      res.__n('There is one monkey in the tree', 3)
    );
    should.equal(
      "There is one monkey in the tree",
      res.__n('There is one monkey in the tree', 1)
    );
  });

  it('returns correctly for one', function() {
    should.equal(
      "The default 'one' rule",
      res.__n('plurals with intervals as string', 1)
    );
  });

  it('returns correctly for zero', function() {
    should.equal(
      "The default 'one' rule",
      res.__n('plurals with intervals as string', 0)
    );
  });

});