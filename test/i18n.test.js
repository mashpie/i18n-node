// Run $ expresso
var I18n = require('../i18n'),
	assert = require('assert');

module.exports = {
	'check version': function () {
		assert.equal(I18n.version, '0.4.6');
	},

	'check set/getLocale': function () {
		var i18n = new I18n({
			locales: ['en', 'de']
		});

		assert.equal('en', i18n.getLocale(), 'should return default setting');
		assert.equal('de', i18n.setLocale('de'), 'should return the new setting');
		assert.equal('de', i18n.getLocale(), 'should return the new setting');
		assert.equal('de', i18n.getLocale(), 'should return the previous default setting');
	},

	'check singular': function () {
		var i18n = new I18n({
			locales: ['en', 'de']
		});

		i18n.setLocale('en');
		assert.equal(i18n.__('Hello'), 'Hello');
		assert.equal(i18n.__('Hello %s, how are you today?', 'Marcus'), 'Hello Marcus, how are you today?');
		assert.equal(i18n.__('Hello %s, how are you today? How was your %s.', 'Marcus', i18n.__('weekend')), 'Hello Marcus, how are you today? How was your weekend.');

		i18n.setLocale('de');
		assert.equal(i18n.__('Hello'), 'Hallo');
		assert.equal(i18n.__('Hello %s, how are you today?', 'Marcus'), 'Hallo Marcus, wie geht es dir heute?');
		assert.equal(i18n.__('Hello %s, how are you today? How was your %s.', 'Marcus', i18n.__('weekend')), 'Hallo Marcus, wie geht es dir heute? Wie war dein Wochenende.');
	},

	'check plural': function () {
		var i18n = new I18n({
			locales: ['en', 'de']
		});

		i18n.setLocale('en');
		var singular = i18n.__n('%s cat', '%s cats', 1);
		var plural = i18n.__n('%s cat', '%s cats', 3);
		assert.equal(singular, '1 cat');
		assert.equal(plural, '3 cats');

		i18n.setLocale('de');
		singular = i18n.__n('%s cat', '%s cats', 1);
		plural = i18n.__n('%s cat', '%s cats', 3);
		assert.equal(singular, '1 Katze');
		assert.equal(plural, '3 Katzen');
	},

	'check nested plural': function () {
		var i18n = new I18n({
			locales: ['en', 'de']
		});

		i18n.setLocale('en');
		var singular = i18n.__n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, i18n.__('tree'));
		var plural = i18n.__n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, i18n.__('tree'));
		assert.equal(singular, 'There is one monkey in the tree');
		assert.equal(plural, 'There are 3 monkeys in the tree');

		i18n.setLocale('de');
		singular = i18n.__n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, i18n.__('tree'));
		plural = i18n.__n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, i18n.__('tree'));
		assert.equal(singular, 'Im Baum sitzt ein Affe');
		assert.equal(plural, 'Im Baum sitzen 3 Affen');
	},

	'check variables': function () {
		var i18n = new I18n({
			locales: ['en', 'de']
		});

		var i = 0;
		i18n.setLocale('en');
		var greetings = ['Hi', 'Hello', 'Howdy'];
		for (i = 0; i < greetings.length; i++) {
			assert.equal(greetings[i], i18n.__(greetings[i]));
		};

		i18n.setLocale('de');
		var greetingsDE = ['Hi', 'Hallo', 'Hallöchen'];
		for (i = 0; i < greetings.length; i++) {
			assert.equal(greetingsDE[i], i18n.__(greetings[i]));
		};
	}
};
