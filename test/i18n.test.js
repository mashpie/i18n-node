// Run $ expresso

var i18n = require('../i18n'),
    __ = i18n.__,
    assert = require('assert');

module.exports = {
    'check version': function() {
        assert.equal(i18n.version, '0.0.2a');
    },
    
    'check set/getLocale': function(){
        assert.equal('en', i18n.getLocale(), 'should return default setting');
        assert.equal('de', i18n.setLocale('de'), 'should return the new setting');
        assert.equal('de', i18n.getLocale(), 'should return the new setting');
    },
    
    'check singular': function() {
        i18n.setLocale('en');
        assert.equal(__('Hello'), 'Hello');
        assert.equal(__('Hello %s, how are you today?', 'Marcus'), 'Hello Marcus, how are you today?');
        assert.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Hello Marcus, how are you today? How was your weekend.');        

        i18n.setLocale('de');
        assert.equal(__('Hello'), 'Hallo');
        assert.equal(__('Hello %s, how are you today?', 'Marcus'), 'Hallo Marcus, wie geht es dir heute?');
        assert.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Hallo Marcus, wie geht es dir heute? Wie war dein Wochenende.');        

    },
    
    'check variables': function() {
        i18n.setLocale('en');
        var greetings = ['Hi', 'Hello', 'Howdy'];        
        for (var i=0; i < greetings.length; i++) {
            assert.equal(greetings[i], __(greetings[i]));
        };
        
        i18n.setLocale('de');
        var greetingsDE = ['Hi', 'Hallo', 'Hallöchen'];        
        for (var i=0; i < greetings.length; i++) {
            assert.equal(greetingsDE[i], __(greetings[i]));
        };
    }
};