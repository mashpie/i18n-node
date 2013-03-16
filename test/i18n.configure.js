/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

var i18n = process.env.EXPRESS_COV ? require('../i18n-cov') : require('../i18n'),
    should = require("should"),
    fs = require('fs');

describe('Module Config', function () {

  var testScope = {};

  beforeEach(function () {
    i18n.configure({
      locales: ['en', 'de'],
      register: testScope,
      directory: './customlocales',
      extension: '.customextension'
    });
    testScope.__('Hello');
  });

  afterEach(function () {
    var stats = fs.lstatSync('./customlocales');
    should.exist(stats);
    if (stats) {
      try {
        fs.unlinkSync('./customlocales/de.customextension');
        fs.unlinkSync('./customlocales/en.customextension');
        fs.rmdirSync('./customlocales');
      } catch (e) {}
    }

  });

  it('should be possible to setup a custom directory', function () {
    var stats = fs.lstatSync('./customlocales');
    should.exist(stats);
  });

  it('should be possible to read custom files with custom extensions', function () {
    var statsde = fs.lstatSync('./customlocales/de.customextension'),
        statsen = fs.lstatSync('./customlocales/en.customextension');
    should.exist(statsde);
    should.exist(statsen);
  });

});
