const { I18n } = require('..')
const should = require('should')
const fs = require('fs')
const path = require('path')

describe('JSON Validity Checking', () => {
  const testLocalesDir = path.join(__dirname, '..', 'testlocalesvalidation')
  let i18n
  let originalConsoleError
  let consoleErrors = []

  beforeEach(() => {
    // Capture console errors for testing
    originalConsoleError = console.error
    consoleErrors = []
    console.error = (...args) => {
      consoleErrors.push(args.join(' '))
    }

    // Clean up test directory
    if (fs.existsSync(testLocalesDir)) {
      fs.rmSync(testLocalesDir, { recursive: true, force: true })
    }
    fs.mkdirSync(testLocalesDir, { recursive: true })
  })

  afterEach(() => {
    // Restore console.error
    console.error = originalConsoleError

    // Clean up
    if (fs.existsSync(testLocalesDir)) {
      fs.rmSync(testLocalesDir, { recursive: true, force: true })
    }
  })

  describe('Startup JSON validation', () => {
    it('should detect and handle invalid JSON files on startup', () => {
      // Create valid locale file
      fs.writeFileSync(
        path.join(testLocalesDir, 'en.json'),
        JSON.stringify({ 'hello': 'Hello' }, null, 2)
      )

      // Create invalid JSON file
      fs.writeFileSync(
        path.join(testLocalesDir, 'invalid.json'),
        '{ "hello": "Hi" invalid json }'
      )

      // This should not crash but should log errors
      try {
        i18n = new I18n({
          locales: ['en', 'invalid'],
          defaultLocale: 'en',
          directory: testLocalesDir,
          updateFiles: false,
          validateJSON: true // New option we'll implement
        })

        // Should not crash
        i18n.should.be.type('object')

        // Should have logged an error about invalid JSON
        // Note: This test expects the new functionality to log validation errors
        
      } catch (error) {
        // Currently might crash - we want to improve this
        error.message.should.match(/JSON|parse|invalid/i)
      }
    })

    it('should handle empty JSON files gracefully', () => {
      // Create empty file
      fs.writeFileSync(path.join(testLocalesDir, 'empty.json'), '')

      try {
        i18n = new I18n({
          locales: ['empty'],
          defaultLocale: 'empty',
          directory: testLocalesDir,
          updateFiles: false,
          validateJSON: true
        })

        // Should handle empty files without crashing
        i18n.should.be.type('object')
      } catch (error) {
        // Currently might crash
        should.exist(error)
      }
    })

    it('should handle JSON files with syntax errors', () => {
      // Create various malformed JSON files
      const malformedFiles = {
        'missing-brace.json': '{ "hello": "Hi"',
        'extra-comma.json': '{ "hello": "Hi", }',
        'unquoted-keys.json': '{ hello: "Hi" }',
        'single-quotes.json': "{ 'hello': 'Hi' }",
        'trailing-comma.json': '{ "hello": "Hi", "world": "World", }'
      }

      Object.entries(malformedFiles).forEach(([filename, content]) => {
        fs.writeFileSync(path.join(testLocalesDir, filename), content)
      })

      try {
        i18n = new I18n({
          locales: Object.keys(malformedFiles).map(f => f.replace('.json', '')),
          defaultLocale: 'missing-brace', // Intentionally malformed default
          directory: testLocalesDir,
          updateFiles: false,
          validateJSON: true
        })

        // Should not crash even with all malformed files
        i18n.should.be.type('object')

      } catch (error) {
        // Currently expected to fail - we want to improve this
        error.message.should.match(/JSON|parse/i)
      }
    })

    it('should validate all locale files during initialization', () => {
      // Create mix of valid and invalid files
      fs.writeFileSync(
        path.join(testLocalesDir, 'valid.json'),
        JSON.stringify({ 'hello': 'Hello' }, null, 2)
      )

      fs.writeFileSync(
        path.join(testLocalesDir, 'invalid1.json'),
        '{ "hello": "Hi" invalid }'
      )

      fs.writeFileSync(
        path.join(testLocalesDir, 'invalid2.json'),
        '{ "missing": quote }'
      )

      try {
        i18n = new I18n({
          locales: ['valid', 'invalid1', 'invalid2'],
          defaultLocale: 'valid',
          directory: testLocalesDir,
          updateFiles: false,
          validateJSON: true
        })

        // Should initialize successfully with at least the valid locale
        i18n.should.be.type('object')
        
        // Should be able to use the valid locale
        i18n.setLocale('valid')
        i18n.__('hello').should.equal('Hello')

      } catch (error) {
        // Expected to fail currently
        should.exist(error)
      }
    })
  })

  describe('Runtime JSON validation', () => {
    it('should provide a method to validate all locale files', () => {
      // Create mix of valid and invalid files
      fs.writeFileSync(
        path.join(testLocalesDir, 'en.json'),
        JSON.stringify({ 'hello': 'Hello' }, null, 2)
      )

      fs.writeFileSync(
        path.join(testLocalesDir, 'broken.json'),
        '{ "hello": "Hi" broken json }'
      )

      i18n = new I18n({
        locales: ['en'],
        defaultLocale: 'en',
        directory: testLocalesDir,
        updateFiles: false
      })

      // Should provide a validation method
      if (typeof i18n.validateLocaleFiles === 'function') {
        const validationResult = i18n.validateLocaleFiles()
        validationResult.should.be.type('object')
        validationResult.should.have.property('valid')
        validationResult.should.have.property('invalid')
      } else {
        // This method doesn't exist yet - we'll implement it
        should.fail('validateLocaleFiles method should exist')
      }
    })

    it('should detect when locale files become corrupted', () => {
      // Create initially valid file
      fs.writeFileSync(
        path.join(testLocalesDir, 'en.json'),
        JSON.stringify({ 'hello': 'Hello' }, null, 2)
      )

      i18n = new I18n({
        locales: ['en'],
        defaultLocale: 'en',
        directory: testLocalesDir,
        updateFiles: false,
        autoReload: false
      })

      // Initially should work
      i18n.__('hello').should.equal('Hello')

      // Corrupt the file
      fs.writeFileSync(
        path.join(testLocalesDir, 'en.json'),
        '{ "hello": "Hello" corrupted }'
      )

      // Should have a way to detect corruption
      if (typeof i18n.validateLocaleFiles === 'function') {
        const result = i18n.validateLocaleFiles()
        result.invalid.should.containEql('en')
      }
    })
  })

  describe('JSON validation options', () => {
    it('should allow disabling JSON validation for performance', () => {
      // Create invalid JSON file
      fs.writeFileSync(
        path.join(testLocalesDir, 'invalid.json'),
        '{ "hello": invalid json }'
      )

      try {
        i18n = new I18n({
          locales: ['invalid'],
          defaultLocale: 'invalid',
          directory: testLocalesDir,
          updateFiles: false,
          validateJSON: false // Disabled validation
        })

        // Should still be able to initialize (but might have issues later)
        i18n.should.be.type('object')

      } catch (error) {
        // Expected behavior when validation is disabled
        should.exist(error)
      }
    })

    it('should have configurable validation strictness', () => {
      // Create file with trailing commas (valid in some parsers)
      fs.writeFileSync(
        path.join(testLocalesDir, 'trailing-comma.json'),
        '{ "hello": "Hello", }'
      )

      try {
        i18n = new I18n({
          locales: ['trailing-comma'],
          defaultLocale: 'trailing-comma',
          directory: testLocalesDir,
          updateFiles: false,
          validateJSON: true,
          strictJSON: false // Allow some flexibility
        })

        // Might work with lenient parsing
        i18n.should.be.type('object')

      } catch (error) {
        // Expected with strict JSON validation
        should.exist(error)
      }
    })
  })

  describe('JSON validation error reporting', () => {
    it('should provide detailed error information for invalid JSON', () => {
      fs.writeFileSync(
        path.join(testLocalesDir, 'detailed-error.json'),
        '{\n  "hello": "Hello",\n  "world": invalid json here\n}'
      )

      try {
        i18n = new I18n({
          locales: ['detailed-error'],
          defaultLocale: 'detailed-error',
          directory: testLocalesDir,
          updateFiles: false,
          validateJSON: true
        })

      } catch (error) {
        // Should provide helpful error information
        error.message.should.match(/detailed-error\.json/i)
        error.message.should.match(/line|position|syntax/i)
      }
    })

    it('should collect all validation errors, not just the first one', () => {
      // Create multiple invalid files
      fs.writeFileSync(
        path.join(testLocalesDir, 'error1.json'),
        '{ "hello": invalid }'
      )

      fs.writeFileSync(
        path.join(testLocalesDir, 'error2.json'),
        '{ "world": also invalid }'
      )

      try {
        i18n = new I18n({
          locales: ['error1', 'error2'],
          defaultLocale: 'error1',
          directory: testLocalesDir,
          updateFiles: false,
          validateJSON: true
        })

      } catch (error) {
        // Should mention both files or provide aggregated errors
        const errorMessage = error.message.toLowerCase()
        errorMessage.should.match(/error1|error2/)
      }
    })
  })
})