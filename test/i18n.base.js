// Run $ expresso
var I18n = require('../i18n'),
	assert = require('assert');

module.exports = {
	'check base': function () {
		var i18n = new I18n({
			locales: ['at-de'],
			base: function(locale) { return locale.slice(-2); }
		});

		i18n.setLocale('at-de');
		assert.equal(i18n.__('Hello'), 'Hallo');
		assert.equal(i18n.__('Hello %s, how are you today? How was your %s.', 'Marcus'), 'Hallo Marcus, wie geht es dir heute? Wie war Ihre Reise nach Wien.');
	},

	'check base - returning nothing reads locale safely': function () {
		var i18n = new I18n({
			locales: ['at-de'],
			base: function() {}
		});

		i18n.setLocale('at-de');
		assert.equal(i18n.__('Hello %s, how are you today? How was your %s.', 'Marcus'), 'Hallo Marcus, wie geht es dir heute? Wie war Ihre Reise nach Wien.');
	},

	'check base - returning not a string reads locale safely': function () {
		var i18n = new I18n({
			locales: ['at-de'],
			base: function() { return {}; }
		});

		i18n.setLocale('at-de');
		assert.equal(i18n.__('Hello %s, how are you today? How was your %s.', 'Marcus'), 'Hallo Marcus, wie geht es dir heute? Wie war Ihre Reise nach Wien.');
	},

	'check base - throwing exception reads locale safely': function () {
		var i18n = new I18n({
			locales: ['at-de'],
			base: function() { throw new Error(); }
		});

		i18n.setLocale('at-de');
		assert.equal(i18n.__('Hello %s, how are you today? How was your %s.', 'Marcus'), 'Hallo Marcus, wie geht es dir heute? Wie war Ihre Reise nach Wien.');
	}
};
