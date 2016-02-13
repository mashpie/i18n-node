/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

// now with coverage suport
var i18n = require('../i18n'),
  should = require("should"),
    path = require("path"),
      fs = require("fs"),
    yaml = require("js-yaml");

describe('retryInDefaultLocale', function () {
  var testLocalesDir = './test/locales';
  var locale_en = {
    greeting: 'Hello',
    approval: {
      formal: "Well done",
      informal: "Alright"
    },
    cats_count: {
      one: "%s cat",
      other: "%s cats"
    }
  };

  beforeEach(function () {
    // make sure there is no cache from previous tests
    i18n.removeLocale('en');

    i18n.serializeLocale = function (localeObj) {
      return yaml.dump(localeObj);
    };
    i18n.deserializeLocale = function (fileContent) {
      return yaml.load(fileContent);
    };

    if (!fs.existsSync(testLocalesDir)) {
      fs.mkdirSync(testLocalesDir);
    }
    fs.writeFileSync(testLocalesDir + '/en.yml', i18n.serializeLocale(locale_en));

    i18n.configure({
      locales: ['en'],
      directory: testLocalesDir,
      extension: '.yml',
      updateFiles: true,
      objectNotation: true
    });
  });

  afterEach(function () {
    if (fs.existsSync(testLocalesDir)) {
      fs.unlinkSync(testLocalesDir + '/en.yml');
      fs.rmdirSync(testLocalesDir);
    }
  });

  describe('parsing locale', function () {
    it('should works for simple', function () {
      should.equal(i18n.__('greeting'), "Hello");
    });

    it('should works for nested', function () {
      should.equal(i18n.__('approval.formal'), "Well done");
    });

    it('should works for plural', function () {
      should.equal(i18n.__n('cats_count', 1), "1 cat");
      should.equal(i18n.__n('cats_count', 2), "2 cats");
    });
  });

  describe('generating locale', function () {
    it('should update locale on missing', function () {
      i18n.__n('dogs_count:%s dog', 'dogs_count: %s dogs', 1);
      var exptected = [
        "greeting: Hello",
        "approval:",
        "  formal: Well done",
        "  informal: Alright",
        "cats_count:",
        "  one: '%s cat'",
        "  other: '%s cats'",
        "dogs_count:",
        "  one: '%s dog'",
        "  other: ' %s dogs'\n"
      ].join("\n");
      should.equal(
        fs.readFileSync(testLocalesDir + '/en.yml').toString(),
        exptected
      );
    });
  });
});
