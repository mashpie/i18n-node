# i18n-node

## Usage

To use the i18n library, you can retrieve translations using the `__` method. 

### Default Translation

You can now specify a default translation value if a key is not found in the translation files.
## Usage
To use the i18n library, you can set translations and retrieve them as follows:
### Default Translations
If a translation is not found, you can specify a default value:

// Load translations
i18n.loadTranslations({
  "Hi": "Hola",
});

// Retrieve translations
console.log(i18n.__('Hi')); // Outputs: Hola
console.log(i18n.__('hello', { defaultValue: 'default_value' })); // Outputs: default_value
console.log(i18n.__('missing_key')); // Outputs: undefined