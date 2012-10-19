// Run $ expresso
var i18n = require('../i18n'),
    assert = require('assert'),
    fs = require('fs');

i18n.configure({
  locales: ['en_US', 'de_DE'],
  register: global,
  directory: './testlocales',
  extension: '.json',
  debug: false
});

module.exports = {
  'check set/getLocale': function () {
    var loc = i18n.getLocale();
    assert.equal('en', loc.language, 'should return default setting');
    assert.equal('US', loc.region, 'should return default setting');
    assert.equal(1, loc.q, 'should return default setting');
    assert.equal('de', i18n.setLocale('de_DE').language, 'should return the new setting');
    assert.equal('de', i18n.getLocale().language, 'should return the new setting');
  },

  'check singular': function () {
    i18n.setLocale('en_US');
    assert.equal(__('Hello'), 'Hello');
    assert.equal(__('Hello %s, how are you today?', 'Marcus'), 'Hello Marcus, how are you today?');
    assert.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Hello Marcus, how are you today? How was your weekend.');
  }
};
