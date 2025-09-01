const i18n = {
  translations: {},
  __: function(key, options) {
    const defaultValue = options && options.defaultValue;
    const translation = this.translations[key];
    return translation !== undefined ? translation : defaultValue;
  },
  setTranslations: function(translations) {    if (translation) {
      return translation;
    }

    return defaultValue !== undefined ? defaultValue : undefined;
  },

  // Method to load translations
  loadTranslations: function(translations) {
    this.translations = { ...this.translations, ...translations };
  }
};

// Example of loading translations
i18n.loadTranslations({
  "Hi": "Hola",
});

// Export the i18n object
module.exports = i18n;