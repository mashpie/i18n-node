'use strict';
var i18n = require('../i18n'),
  clear = require('./helpers/clear'),
  should = require("should"),
  fs = require('fs');

describe('Module Defaults', function() {

  var testScope = {};

  beforeEach(function() {
    i18n.configure({
      locales: ['en', 'de'],
      register: testScope,
      directory: './defaultlocales'
    });
    testScope.__('Hello');
  });

  afterEach(function(d) {
    d(clear(i18n))

  });

  it('should be possible to setup a custom directory', function() {
    var stats = fs.lstatSync('./defaultlocales');
    should.exist(stats);
  });

  it('should be possible to read custom files with default a extension of .json (issue #16)', function() {
    var statsde = fs.lstatSync('./defaultlocales/de.json'),
      statsen = fs.lstatSync('./defaultlocales/en.json');
    should.exist(statsde);
    should.exist(statsen);
  });

});