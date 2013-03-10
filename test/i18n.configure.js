/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

var i18n = process.env.EXPRESS_COV ? require('../i18n-cov') : require('../i18n'),
    should = require("should"),
    fs = require('fs');

describe('Module Config', function () {

  var testScope = {};

  beforeEach(function () {
    i18n.configure({
      locales: ['en', 'de'],
      defaultLocale: 'en',
      register: testScope,
      directory: './testlocales',
      extension: '.json',
      debug: false,
      verbose: false
    });
  });

  afterEach(function () {
    var stats = fs.lstatSync('./testlocales');
    should.exist(stats);
    if (stats) {
      fs.unlinkSync('./testlocales/de.json');
      fs.unlinkSync('./testlocales/en.json');
      fs.rmdirSync('./testlocales');
    }
  });

  it('setting locales in scope should return appropiate locale', function () {
    should.equal('de', i18n.setLocale(testScope, 'de'));
  });

  it('getting locales in scope should return appropiate locale', function () {
    i18n.setLocale(testScope, 'de')
    should.equal('de', testScope.getLocale(testScope));
  });

  it('getting defaultLocale should return appropiate locale', function () {
    should.equal('en', i18n.getLocale());
  });

  it('translations should work', function () {
    i18n.setLocale(testScope, 'de');
    should.equal(testScope.__('Hello'), 'Hallo');
    should.equal(testScope.__('Hello %s, how are you today?', 'Marcus'), 'Hallo Marcus, wie geht es dir heute?');
    should.equal(testScope.__('Hello %s, how are you today? How was your %s.', 'Marcus', testScope.__('weekend')), 'Hallo Marcus, wie geht es dir heute? Wie war dein Wochenende.');
  });

  it('the custom directory should exist', function () {
    var stats = fs.lstatSync('./testlocales');
    should.exist(stats);
  });

  it('the custom files should exist with custom extensions', function () {
    var statsde = fs.lstatSync('./testlocales/de.json'),
        statsen = fs.lstatSync('./testlocales/en.json');
    should.exist(statsde);
    should.exist(statsen);
  });


});
