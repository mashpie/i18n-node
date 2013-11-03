/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

// now with coverage suport
var should = require("should");
var i18n = process.env.EXPRESS_COV ? require('../i18n-cov') : require('../i18n');
i18n.configure({
  locales: ['en', 'de'],
  directory: './locales',
  extension: '.yml',
  register: global
});

describe('YAML support', function () {
  it('should read files with .yml extension', function () {
    i18n.setLocale('en');
    should.equal('Yaml en', __('Yaml'));
    i18n.setLocale('de');
    should.equal('Yaml de', __('Yaml'));
  });
});
