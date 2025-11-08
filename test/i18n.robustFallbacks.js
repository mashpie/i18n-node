const { I18n } = require('..')
const should = require('should')
const fs = require('fs')
const path = require('path')

describe('Robust Fallback Logic', () => {
  const testLocalesDir = path.join(__dirname, '..', 'testlocalesrobust')
  let i18n

  beforeEach(() => {
    // Clean up test directory
    if (fs.existsSync(testLocalesDir)) {
      fs.rmSync(testLocalesDir, { recursive: true, force: true })
    }
    fs.mkdirSync(testLocalesDir, { recursive: true })

    // Create test locale files
    fs.writeFileSync(
      path.join(testLocalesDir, 'en.json'),
      JSON.stringify({
        'hello': 'Hello',
        'goodbye': 'Goodbye',
        'world': 'World',
        'greeting.formal': 'Hello Sir',
        'greeting.informal': 'Hi there'
      }, null, 2)
    )

    fs.writeFileSync(
      path.join(testLocalesDir, 'es.json'),
      JSON.stringify({
        'hello': 'Hola',
        'world': 'Mundo'
        // Note: missing 'goodbye' and greeting keys
      }, null, 2)
    )

    fs.writeFileSync(
      path.join(testLocalesDir, 'fr.json'),
      JSON.stringify({
        'hello': 'Bonjour'
        // Note: missing many keys
      }, null, 2)
    )

    i18n = new I18n({
      locales: ['en', 'es', 'fr'],
      defaultLocale: 'en',
      directory: testLocalesDir,
      updateFiles: false,
      retryInDefaultLocale: false // We'll test both modes
    })
  })

  afterEach(() => {
    // Clean up
    if (fs.existsSync(testLocalesDir)) {
      fs.rmSync(testLocalesDir, { recursive: true, force: true })
    }
  })

  describe('Missing key fallback without retryInDefaultLocale', () => {
    it('should return the key itself when translation is missing and retryInDefaultLocale is false', () => {
      i18n.setLocale('es')
      // This should fail - currently returns 'goodbye' instead of falling back to default locale
      i18n.__('goodbye').should.equal('goodbye') // Current behavior - returns key
    })

    it('should return the key itself for nested missing keys', () => {
      i18n.setLocale('es')
      // This should fail - currently returns the key instead of falling back
      i18n.__('greeting.formal').should.equal('greeting.formal') // Current behavior
    })
  })

  describe('Missing key fallback WITH retryInDefaultLocale enabled', () => {
    beforeEach(() => {
      i18n.configure({
        locales: ['en', 'es', 'fr'],
        defaultLocale: 'en',
        directory: testLocalesDir,
        updateFiles: false,
        retryInDefaultLocale: true
      })
    })

    it('should fallback to default locale for missing keys', () => {
      i18n.setLocale('es')
      // This currently works correctly
      i18n.__('goodbye').should.equal('Goodbye')
    })

    it('should fallback to default locale for nested missing keys', () => {
      i18n.setLocale('es')
      // This currently works correctly
      i18n.__('greeting.formal').should.equal('Hello Sir')
    })

    it('should fallback to default locale for missing plural keys', () => {
      i18n.setLocale('es')
      // This should fail - plurals might not fallback properly
      try {
        const result = i18n.__n('item', 'items', 1)
        result.should.equal('item') // Should fallback to default locale behavior
      } catch (error) {
        // This might throw if fallback is not working
        should.fail('Should not throw when falling back to default locale')
      }
    })
  })

  describe('Locale fallback when locale is completely missing', () => {
    it('should use default locale when requested locale file does not exist', () => {
      i18n.setLocale('de') // German not in our test locales
      i18n.getLocale().should.equal('en') // Should fallback to default
      i18n.__('hello').should.equal('Hello') // Should use default locale translation
    })

    it('should handle missing locale gracefully in __n', () => {
      i18n.setLocale('de')
      try {
        const result = i18n.__n('item', 'items', 1)
        result.should.be.type('string')
        // Should not throw and should return something reasonable
      } catch (error) {
        should.fail('Should handle missing locale gracefully: ' + error.message)
      }
    })
  })

  describe('Edge cases that should be robust', () => {
    it('should handle empty locale files gracefully', () => {
      // Create an empty locale file
      fs.writeFileSync(path.join(testLocalesDir, 'empty.json'), '{}')
      
      i18n.configure({
        locales: ['en', 'empty'],
        defaultLocale: 'en',
        directory: testLocalesDir,
        updateFiles: false,
        retryInDefaultLocale: true
      })

      i18n.setLocale('empty')
      i18n.__('hello').should.equal('Hello') // Should fallback to default
    })

    it('should handle malformed locale files gracefully', () => {
      // This test will be for JSON validity checking
      fs.writeFileSync(path.join(testLocalesDir, 'malformed.json'), '{ "hello": "Hi" invalid json }')
      
      i18n.configure({
        locales: ['en', 'malformed'],
        defaultLocale: 'en',
        directory: testLocalesDir,
        updateFiles: false,
        retryInDefaultLocale: true
      })

      i18n.setLocale('malformed')
      // Should handle malformed JSON and fallback to default
      i18n.__('hello').should.equal('Hello')
    })
  })
})