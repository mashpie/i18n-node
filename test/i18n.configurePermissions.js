/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

var i18n = process.env.EXPRESS_COV ? require('../i18n-cov') : require('../i18n'),
    should = require("should"),
    path = require("path"),
    fs = require('fs');

describe('Module Config (directoryPermissions)', function () {

  var testScope = {};

  afterEach(function () {
    var stats = fs.lstatSync('./customlocales');
    should.exist(stats);
    if (stats) {
      try {
        fs.unlinkSync('./customlocales/customprefix-de.customextension');
        fs.unlinkSync('./customlocales/customprefix-en.customextension');
        fs.rmdirSync('./customlocales');
      } catch (e) {}
    }

  });

  it('should be possible to setup a custom directory with default permissions', function () {
    i18n.configure({
      locales: ['en', 'de'],
      register: testScope,
      directory: './customlocales',
      extension: '.customextension',
      prefix:'customprefix-'
    });
    testScope.__('Hello');
    var stat = fs.lstatSync('./customlocales');
    console.log(parseInt(stat.mode.toString(8), 10));
    should.exist(stat);
  });

  it('should be possible to setup a custom directory with customized permissions', function () {
    i18n.configure({
      locales: ['en', 'de'],
      register: testScope,
      directoryPermissions: '700',
      directory: './customlocales',
      extension: '.customextension',
      prefix:'customprefix-'
    });
    testScope.__('Hello');
    var stat = fs.lstatSync('./customlocales');
    should.equal('40700', parseInt(stat.mode.toString(8), 10));
    should.exist(stat);
  });

  it('should be possible to setup a custom directory with customized permissions', function () {
    i18n.configure({
      locales: ['en', 'de'],
      register: testScope,
      directoryPermissions: '750',
      directory: './customlocales',
      extension: '.customextension',
      prefix:'customprefix-'
    });
    testScope.__('Hello');
    var stat = fs.lstatSync('./customlocales');
    should.equal('40750', parseInt(stat.mode.toString(8), 10));
    should.exist(stat);
  });

});
