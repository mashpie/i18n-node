/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

var i18n = require('../i18n'),
    assert = require('assert');

i18n.configure({
  locales: ['en', 'de'],
  register: global
});

module.exports = {
  'check version': function () {
    assert.equal(i18n.version, '0.3.6');
  },

  'check set/getLocale': function () {
    assert.equal('en', i18n.getLocale(), 'should return default setting');
    assert.equal('de', i18n.setLocale('de'), 'should return the new setting');
    assert.equal('de', i18n.getLocale(), 'should return the new setting');
    assert.equal('en', i18n.setLocale({}, 'en'), 'should return the request setting');
    assert.equal('de', i18n.getLocale(), 'should return the previous default setting');
  },

  'check singular': function () {
    i18n.setLocale('en');
    assert.equal(__('Hello'), 'Hello');
    assert.equal(__('Hello %s, how are you today?', 'Marcus'), 'Hello Marcus, how are you today?');
    assert.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Hello Marcus, how are you today? How was your weekend.');

    i18n.setLocale('de');
    assert.equal(__('Hello'), 'Hallo');
    assert.equal(__('Hello %s, how are you today?', 'Marcus'), 'Hallo Marcus, wie geht es dir heute?');
    assert.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Hallo Marcus, wie geht es dir heute? Wie war dein Wochenende.');

  },

  'check plural': function () {
    i18n.setLocale('en');
    var singular = __n('%s cat', '%s cats', 1),
        plural = __n('%s cat', '%s cats', 3);
    assert.equal(singular, '1 cat');
    assert.equal(plural, '3 cats');

    i18n.setLocale('de');
    singular = __n('%s cat', '%s cats', 1);
    plural = __n('%s cat', '%s cats', 3);
    assert.equal(singular, '1 Katze');
    assert.equal(plural, '3 Katzen');
  },

  'check nested plural': function () {
    i18n.setLocale('en');
    var singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, __('tree')),
        plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, __('tree'));
    assert.equal(singular, 'There is one monkey in the tree');
    assert.equal(plural, 'There are 3 monkeys in the tree');

    i18n.setLocale('de');
    singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, __('tree'));
    plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, __('tree'));
    assert.equal(singular, 'Im Baum sitzt ein Affe');
    assert.equal(plural, 'Im Baum sitzen 3 Affen');

  },

  'check variables': function () {
    var i = 0,
        greetings = ['Hi', 'Hello', 'Howdy'],
        greetingsDE = ['Hi', 'Hallo', 'Hallöchen'];

    i18n.setLocale('en');
    for (i = 0; i < greetings.length; i++) {
      assert.equal(greetings[i], __(greetings[i]));
    }

    i18n.setLocale('de');
    for (i = 0; i < greetings.length; i++) {
      assert.equal(greetingsDE[i], __(greetings[i]));
    }
  }
};
