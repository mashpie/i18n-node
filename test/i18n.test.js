// Run $ expresso
var i18n = require('../i18n'),
    assert = require('assert');

i18n.configure({
  // setup some locales - other locales default to en silently
  locales: ['en', 'de', 'ru'],

  // where to register __() and __n() to, might be "global" if you know what you are doing
  register: global

});

module.exports = {
  'check version': function () {
    assert.equal(i18n.version, '0.3.5');
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

    i18n.setLocale('ru');
    assert.equal(__('Hello'), 'Привет');
    assert.equal(__('Hello %s, how are you today?', 'Marcus'), 'Привет, Marcus, как дела?');
    assert.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Привет, Marcus, как дела? Как прошли выходные?');

  },

  'check plural': function () {
    i18n.setLocale('en');
    var singular = __n('%s cat', '%s cats', 1);
    var plural = __n('%s cat', '%s cats', 3);
    assert.equal(singular, '1 cat');
    assert.equal(plural, '3 cats');

    i18n.setLocale('de');
    singular = __n('%s cat', '%s cats', 1);
    plural = __n('%s cat', '%s cats', 3);
    assert.equal(singular, '1 Katze');
    assert.equal(plural, '3 Katzen');

    i18n.setLocale('ru');
    var zero = __n('%s cat', '%s cats', 0);
    singular = __n('%s cat', '%s cats', 1);
    pluralTwo = __n('%s cat', '%s cats', 2);
    pluralFive = __n('%s cat', '%s cats', 5);
    pluralTwenty = __n('%s cat', '%s cats', 20);
    pluralTwentyOne = __n('%s cat', '%s cats', 21);

    assert.equal(zero, 'ни одной кошки');
    assert.equal(singular, '1 кошка');
    assert.equal(pluralTwo, '2 кошки');
    assert.equal(pluralFive, '5 кошек');
    assert.equal(pluralTwenty, '20 кошек');
    assert.equal(pluralTwentyOne, '21 кошка');
  },

  'check nested plural': function () {
    i18n.setLocale('en');
    var singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, __('tree'));
    var plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, __('tree'));
    assert.equal(singular, 'There is one monkey in the tree');
    assert.equal(plural, 'There are 3 monkeys in the tree');

    i18n.setLocale('de');
    singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, __('tree'));
    plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, __('tree'));
    assert.equal(singular, 'Im Baum sitzt ein Affe');
    assert.equal(plural, 'Im Baum sitzen 3 Affen');

    i18n.setLocale('ru');
    singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, __('tree'));
    plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, __('tree'));
    zero = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 0, __('tree'));
    assert.equal(singular, 'На дереве сидит 1 обезьянка');
    assert.equal(plural, 'На дереве сидят 3 обезьянки');
    assert.equal(zero, 'На дереве сидят 0 обезьянок');
  },

  'check variables': function () {
    var i = 0;
    i18n.setLocale('en');
    var greetings = ['Hi', 'Hello', 'Howdy'];
    for (i = 0; i < greetings.length; i++) {
      assert.equal(greetings[i], __(greetings[i]));
    };

    i18n.setLocale('de');
    var greetingsDE = ['Hi', 'Hallo', 'Hallöchen'];
    for (i = 0; i < greetings.length; i++) {
      assert.equal(greetingsDE[i], __(greetings[i]));
    };
  }
};
