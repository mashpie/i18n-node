/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

var i18n = process.env.EXPRESS_COV ? require('../i18n-cov') : require('../i18n'),
    should = require("should"),
    fs = require('fs');

describe('Module Defaults', function () {

  var testScope = {};

  beforeEach(function () {
    i18n.configure({
      locales: ['en', 'de'],
      register: testScope,
      directory: './defaultlocales'
    });
    testScope.__('Hello');
  });

  afterEach(function () {
    var stats = fs.lstatSync('./defaultlocales');
    should.exist(stats);
    if (stats) {
      try {
        fs.unlinkSync('./defaultlocales/de.json');
        fs.unlinkSync('./defaultlocales/en.json');
        fs.rmdirSync('./defaultlocales');
      } catch (e) {}
    }

  });

  it('should be possible to setup a custom directory', function () {
    var stats = fs.lstatSync('./defaultlocales');
    should.exist(stats);
  });

  it('should be possible to read custom files with default a extension of .json (issue #16)', function () {
    var statsde = fs.lstatSync('./defaultlocales/de.json'),
        statsen = fs.lstatSync('./defaultlocales/en.json');
    should.exist(statsde);
    should.exist(statsen);
  });

});
