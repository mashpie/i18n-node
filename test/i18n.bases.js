// Run $ expresso
var I18n = require('../i18n'),
	assert = require('assert');

module.exports = {
	'check bases - simple match': function () {
		var i18n = new I18n({
			locales: ['at-de', 'de-en'],
			bases: '.{2}$'
		});

		i18n.setLocale('at-de');
		assert.equal(i18n.__('Hello'), 'Hallo');
		assert.equal(i18n.__('Hello %s, how are you today? How was your %s.', 'Marcus'), 'Hallo Marcus, wie geht es dir heute? Wie war Ihre Reise nach Wien?');

		i18n.setLocale('de-en');
		assert.equal(i18n.__('Hello'), 'Hello');
		assert.equal(i18n.__('Hello %s, how are you today? How was your %s.', 'Marcus'), 'Hello Marcus, how are you today? How was your trip to Berlin?');
	},

	'check bases - last matching group': function () {
		var i18n = new I18n({
			locales: ['at-de', 'de-en'],
			bases: '[^-]*-(.*)'
		});

		i18n.setLocale('at-de');
		assert.equal(i18n.__('Hello'), 'Hallo');
		assert.equal(i18n.__('Hello %s, how are you today? How was your %s.', 'Marcus'), 'Hallo Marcus, wie geht es dir heute? Wie war Ihre Reise nach Wien?');

		i18n.setLocale('de-en');
		assert.equal(i18n.__('Hello'), 'Hello');
		assert.equal(i18n.__('Hello %s, how are you today? How was your %s.', 'Marcus'), 'Hello Marcus, how are you today? How was your trip to Berlin?');
	},

	'check bases - no match reads locale safely': function () {
		var i18n = new I18n({
			locales: ['at-de', 'de-en'],
			bases: '.*!(.*)'
		});

		i18n.setLocale('at-de');
		assert.equal(i18n.__('Hello %s, how are you today? How was your %s.', 'Marcus'), 'Hallo Marcus, wie geht es dir heute? Wie war Ihre Reise nach Wien?');

		i18n.setLocale('de-en');
		assert.equal(i18n.__('Hello %s, how are you today? How was your %s.', 'Marcus'), 'Hello Marcus, how are you today? How was your trip to Berlin?');
	}
};
