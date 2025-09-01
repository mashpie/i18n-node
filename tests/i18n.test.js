const i18n = require('../i18n');

describe('i18n', () => {
  beforeEach(() => {
    i18n.loadTranslations({
      "Hi": "Hola",
    });
  });

  test('returns default value for missing key', () => {
    expect(i18n.__('missing_key', { defaultValue: 'default_value' })).toBe('default_value');
  });

  test('returns correct translation for existing key', () => {
    expect(i18n.__('Hi')).toBe('Hola');
  });

  test('returns undefined for missing key without default value', () => {
    expect(i18n.__('missing_key')).toBeUndefined();
  });
});