const i18n = {
  translations: {},

  __: function(key, options = {}) {
    const { defaultValue } = options;
    const translation = this.translations[key];

    if (translation) {
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