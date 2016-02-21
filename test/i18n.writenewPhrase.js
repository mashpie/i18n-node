var i18n = require('../i18n'),
  should = require("should"),
  fs = require('fs'),
  path = require('path');

var directory = './localestowrite';

    //   fs.mkdirSync(directory);
    // fs.writeFileSync(directory + '/.gitkeepornot', 'just kidding');
    // fs.writeFileSync(directory + '/app-de.json', '{}');
    // fs.writeFileSync(directory + '/app-en.json', '{}');

function getJson(l){
  return JSON.parse(fs.readFileSync(directory + '/' + l + '.json'));
}

describe('when we get a new phrase', function() {

  var TestScope = {};
  var locales = ['en', 'de', 'fr', 'ru'];

  beforeEach(function() {
    TestScope = {};
    i18n.configure({
      locales: locales,
      register: TestScope,
      directory: directory,
      updateFiles: true,
      objectNotation: true
    });
  });

  it('should get written to all files with __()', function(done){
    TestScope.setLocale('en');
    TestScope.__('Hello World');
    should.deepEqual(getJson('en'), { 'Hello World': 'Hello World' });

    TestScope.setLocale('de');
    TestScope.__('Hello World');
    should.deepEqual(getJson('de'), { 'Hello World': 'Hello World' });
    done();
  });

});