# i18n-node

## Usage

To use the i18n library, you can retrieve translations using the `__` method. 

### Default Translation

You can now specify a default translation value if a key is not found in the translation files.

const i18n = require('./i18n');

// Load translations
i18n.loadTranslations({
  "Hi": "Hola",
});

// Retrieve translations
console.log(i18n.__('Hi')); // Outputs: Hola
console.log(i18n.__('hello', { defaultValue: 'default_value' })); // Outputs: default_value
console.log(i18n.__('missing_key')); // Outputs: undefined