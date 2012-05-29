var vows = require('vows'),
    assert = require('assert'),
    i18n = require('../i18n');
    
i18n.configure({
  locales: ['en', 'de'],
  register: global,
  directory: './testlocales',
  extension: '.json',
  debug: false,
  verbose: false
});

vows.describe('Configuration settings').addBatch({
  
  'when setting to custom directory with custom extension': {
    
    'setLocale and getLocale should still be able to set current locale': function () {
      assert.equal('en', i18n.getLocale(), 'should return default setting');
      assert.equal('de', i18n.setLocale('de'), 'should return the new setting');
      assert.equal('de', i18n.getLocale(), 'should return the new setting');
    },

    'and some basic translations should still work': function () {
      i18n.setLocale('en');
      assert.equal(__('Hello'), 'Hello');
      assert.equal(__('Hello %s, how are you today?', 'Marcus'), 'Hello Marcus, how are you today?');
      assert.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Hello Marcus, how are you today? How was your weekend.');
    }
  }
}).export(module);
