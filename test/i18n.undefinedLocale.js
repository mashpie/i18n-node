const { I18n } = require('..')
const should = require('should')
const fs = require('fs')
const path = require('path')

describe('Undefined/Null Locale Handling', () => {
  const testLocalesDir = path.join(__dirname, '..', 'testlocalesundefined')
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
        'goodbye': 'Goodbye'
      }, null, 2)
    )

    fs.writeFileSync(
      path.join(testLocalesDir, 'es.json'),
      JSON.stringify({
        'hello': 'Hola',
        'goodbye': 'Adiós'
      }, null, 2)
    )

    i18n = new I18n({
      locales: ['en', 'es'],
      defaultLocale: 'en',
      directory: testLocalesDir,
      updateFiles: false
    })
  })

  afterEach(() => {
    // Clean up
    if (fs.existsSync(testLocalesDir)) {
      fs.rmSync(testLocalesDir, { recursive: true, force: true })
    }
  })

  describe('Translation API with undefined locale', () => {
    it('should use default locale when locale is undefined in __', () => {
      const req = { locale: undefined }
      
      // This should fail - might return undefined or throw
      try {
        const result = i18n.__.call(req, 'hello')
        result.should.equal('Hello') // Should use default locale
      } catch (error) {
        should.fail('Should handle undefined locale gracefully: ' + error.message)
      }
    })

    it('should use default locale when locale is null in __', () => {
      const req = { locale: null }
      
      try {
        const result = i18n.__.call(req, 'hello')
        result.should.equal('Hello') // Should use default locale
      } catch (error) {
        should.fail('Should handle null locale gracefully: ' + error.message)
      }
    })

    it('should use default locale when locale is undefined in __n', () => {
      const req = { locale: undefined }
      
      try {
        const result = i18n.__n.call(req, 'item', 'items', 1)
        result.should.be.type('string')
        // Should not throw and should use default locale
      } catch (error) {
        should.fail('Should handle undefined locale gracefully in __n: ' + error.message)
      }
    })

    it('should use default locale when locale is null in __n', () => {
      const req = { locale: null }
      
      try {
        const result = i18n.__n.call(req, 'item', 'items', 1)
        result.should.be.type('string')
        // Should not throw and should use default locale
      } catch (error) {
        should.fail('Should handle null locale gracefully in __n: ' + error.message)
      }
    })
  })

  describe('setLocale with undefined/null values', () => {
    it('should handle setLocale with undefined gracefully', () => {
      const req = {}
      
      try {
        i18n.setLocale(req, undefined)
        // Should not crash and should set to default locale
        i18n.getLocale(req).should.equal('en')
      } catch (error) {
        should.fail('Should handle setLocale(undefined) gracefully: ' + error.message)
      }
    })

    it('should handle setLocale with null gracefully', () => {
      const req = {}
      
      try {
        i18n.setLocale(req, null)
        // Should not crash and should set to default locale
        i18n.getLocale(req).should.equal('en')
      } catch (error) {
        should.fail('Should handle setLocale(null) gracefully: ' + error.message)
      }
    })

    it('should handle setLocale with empty string gracefully', () => {
      const req = {}
      
      try {
        i18n.setLocale(req, '')
        // Should not crash and should set to default locale
        i18n.getLocale(req).should.equal('en')
      } catch (error) {
        should.fail('Should handle setLocale("") gracefully: ' + error.message)
      }
    })
  })

  describe('getCatalog with undefined/null values', () => {
    it('should handle getCatalog with undefined locale gracefully', () => {
      try {
        const result = i18n.getCatalog(undefined, undefined)
        // Should return all catalogs or default catalog, not crash
        result.should.be.type('object')
      } catch (error) {
        should.fail('Should handle getCatalog(undefined) gracefully: ' + error.message)
      }
    })

    it('should handle getCatalog with null locale gracefully', () => {
      try {
        const result = i18n.getCatalog(null, null)
        // Should return all catalogs or default catalog, not crash
        result.should.be.type('object')
      } catch (error) {
        should.fail('Should handle getCatalog(null) gracefully: ' + error.message)
      }
    })

    it('should return default catalog when object has undefined locale', () => {
      const req = { locale: undefined }
      
      try {
        const result = i18n.getCatalog(req)
        // Should return default catalog or all catalogs
        result.should.be.type('object')
        if (result.hello) {
          result.hello.should.equal('Hello') // Should be default locale content
        }
      } catch (error) {
        should.fail('Should handle object with undefined locale: ' + error.message)
      }
    })

    it('should return default catalog when object has null locale', () => {
      const req = { locale: null }
      
      try {
        const result = i18n.getCatalog(req)
        // Should return default catalog or all catalogs
        result.should.be.type('object')
        if (result.hello) {
          result.hello.should.equal('Hello') // Should be default locale content
        }
      } catch (error) {
        should.fail('Should handle object with null locale: ' + error.message)
      }
    })
  })

  describe('Direct translate function behavior', () => {
    it('should handle direct translate calls with undefined locale', () => {
      // Testing calling __ when context object has undefined locale
      const req = { locale: undefined }
      try {
        const result = i18n.__.call(req, 'hello')
        result.should.be.type('string')
        // Should not crash and should use default locale
        result.should.equal('Hello')
      } catch (error) {
        should.fail('Should handle undefined locale context: ' + error.message)
      }
    })

    it('should handle direct translate calls with null locale', () => {
      const req = { locale: null }
      try {
        const result = i18n.__.call(req, 'hello')
        result.should.be.type('string')
        // Should not crash and should use default locale
        result.should.equal('Hello')
      } catch (error) {
        should.fail('Should handle null locale context: ' + error.message)
      }
    })
  })

  describe('Object with complex undefined/null scenarios', () => {
    it('should handle object with undefined locale property gracefully', () => {
      const complexReq = {
        headers: { 'accept-language': 'es' },
        locale: undefined // Explicitly undefined
      }

      try {
        const result = i18n.__.call(complexReq, 'hello')
        result.should.be.type('string')
        // Should use default locale since locale property is undefined
      } catch (error) {
        should.fail('Should handle complex undefined scenario: ' + error.message)
      }
    })

    it('should handle object with null locale property gracefully', () => {
      const complexReq = {
        headers: { 'accept-language': 'es' },
        locale: null // Explicitly null
      }

      try {
        const result = i18n.__.call(complexReq, 'hello')
        result.should.be.type('string')
        // Should use default locale since locale property is null
      } catch (error) {
        should.fail('Should handle complex null scenario: ' + error.message)
      }
    })
  })
})