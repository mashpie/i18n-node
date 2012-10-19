// Run $ expresso
var i18n = require('../i18n'),
    assert = require('assert');

i18n.configure({
  // setup some locales - other locales default to en silently
  locales: ['en_US', 'de_DE'],

  // where to register __() and __n() to, might be "global" if you know what you are doing
  register: global

});

module.exports = {
  'check version': function () {
    assert.equal(i18n.version, '0.3.5');
  },

  'check set/getLocale language only': function () {
    assert.equal('en', i18n.getLocale().language, 'should return default setting');
    assert.equal('de', i18n.setLocale('de').language, 'should return the new setting');
    assert.equal('de', i18n.setLocale('ec').language, 'should keep previous setting');
  },

  'check set/getLocale': function () {
    var req = {};
    i18n.setLocale('en');
    assert.equal('en', i18n.getLocale().language, 'should return default setting');
    assert.equal('de', i18n.setLocale('de_DE').language, 'should return the new setting');
    assert.equal('de', i18n.getLocale().language, 'should return the new setting');
    assert.equal('en', i18n.setLocale(req, 'en_US').language, 'should return the request setting');
    assert.equal('en', i18n.setLocale(req, 'ec').language, 'should keep previous setting');
    assert.equal('de', i18n.getLocale().language, 'should return the previous default setting');
  },

  'check singular': function () {
    i18n.setLocale('en_US');
    assert.equal(__('Hello'), 'Hello');
    assert.equal(__('Hello %s, how are you today?', 'Marcus'), 'Hello Marcus, how are you today?');
    assert.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Hello Marcus, how are you today? How was your weekend.');

    i18n.setLocale('de_DE');
    assert.equal(__('Hello'), 'Hallo');
    assert.equal(__('Hello %s, how are you today?', 'Marcus'), 'Hallo Marcus, wie geht es dir heute?');
    assert.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Hallo Marcus, wie geht es dir heute? Wie war dein Wochenende.');

  },

  'check plural': function () {
    i18n.setLocale('en_US');
    var singular = __n('%s cat', '%s cats', 1);
    var plural = __n('%s cat', '%s cats', 3);
    assert.equal(singular, '1 cat');
    assert.equal(plural, '3 cats');

    i18n.setLocale('de_DE');
    singular = __n('%s cat', '%s cats', 1);
    plural = __n('%s cat', '%s cats', 3);
    assert.equal(singular, '1 Katze');
    assert.equal(plural, '3 Katzen');
  },

  'check nested plural': function () {
    i18n.setLocale('en_US');
    var singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, __('tree'));
    var plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, __('tree'));
    assert.equal(singular, 'There is one monkey in the tree');
    assert.equal(plural, 'There are 3 monkeys in the tree');

    i18n.setLocale('de_DE');
    singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, __('tree'));
    plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, __('tree'));
    assert.equal(singular, 'Im Baum sitzt ein Affe');
    assert.equal(plural, 'Im Baum sitzen 3 Affen');
  },

  'check variables': function () {
    var i = 0;
    i18n.setLocale('en_US');
    var greetings = ['Hi', 'Hello', 'Howdy'];
    for (i = 0; i < greetings.length; i++) {
      assert.equal(greetings[i], __(greetings[i]));
    };

    i18n.setLocale('de_DE');
    var greetingsDE = ['Hi', 'Hallo', 'Hallöchen'];
    for (i = 0; i < greetings.length; i++) {
      assert.equal(greetingsDE[i], __(greetings[i]));
    };
  }
};