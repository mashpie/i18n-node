const __ = require('../i18n');



describe('i18n', () => {

    test('returns default value for missing key', () => {

        expect(__('missing_key', { defaultValue: 'default_value' })).toBe('default_value');

    });



    test('returns correct translation for existing key', () => {

        expect(__('Hi')).toBe('Hola'); // Assuming 'Hi' is in en.json

    });



    test('returns undefined for missing key without default value', () => {

        expect(__('missing_key')).toBeUndefined();

    });

});
