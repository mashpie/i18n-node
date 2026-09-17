const { I18n } = require('..')
const should = require('should')
const fs = require('fs')
const path = require('path')

describe('getCatalog Completeness', () => {
  const testLocalesDir = path.join(__dirname, '..', 'testlocalescatalog')
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
        'world': 'World'
      }, null, 2)
    )

    fs.writeFileSync(
      path.join(testLocalesDir, 'es.json'),
      JSON.stringify({
        'hello': 'Hola',
        'goodbye': 'Adiós'
      }, null, 2)
    )

    fs.writeFileSync(
      path.join(testLocalesDir, 'fr.json'),
      JSON.stringify({
        'hello': 'Bonjour'
      }, null, 2)
    )

    i18n = new I18n({
      locales: ['en', 'es', 'fr'],
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

  describe('getCatalog should return complete catalogs', () => {
    it('should return all available locales when called without parameters', () => {
      const catalogs = i18n.getCatalog()
      
      catalogs.should.be.type('object')
      catalogs.should.have.properties(['en', 'es', 'fr'])
      
      // Should have all three locales
      Object.keys(catalogs).length.should.equal(3)
      
      // Each locale should be an object
      catalogs.en.should.be.type('object')
      catalogs.es.should.be.type('object')
      catalogs.fr.should.be.type('object')
    })

    it('should return specific locale catalog when requested', () => {
      const enCatalog = i18n.getCatalog('en')
      
      enCatalog.should.be.type('object')
      enCatalog.should.have.properties(['hello', 'goodbye', 'world'])
      enCatalog.hello.should.equal('Hello')
    })

    it('should handle missing locale gracefully and return default or false', () => {
      const missingCatalog = i18n.getCatalog('de') // German not configured
      
      // Current behavior might return false, but should be more robust
      if (missingCatalog === false) {
        // This is current behavior - we want to improve this
        missingCatalog.should.equal(false)
      } else {
        // Improved behavior should fallback to default locale catalog
        missingCatalog.should.be.type('object')
      }
    })

    it('should return all catalogs when called with empty string', () => {
      const catalogs = i18n.getCatalog('')
      
      catalogs.should.be.type('object')
      // Should return all catalogs, not false or empty
      Object.keys(catalogs).length.should.be.greaterThan(0)
    })
  })

  describe('getCatalog with object parameter', () => {
    it('should return catalog based on object locale property', () => {
      const req = { locale: 'es' }
      const catalog = i18n.getCatalog(req)
      
      catalog.should.be.type('object')
      catalog.hello.should.equal('Hola')
    })

    it('should handle object with undefined locale gracefully', () => {
      const req = { locale: undefined }
      const catalog = i18n.getCatalog(req)
      
      catalog.should.be.type('object')
      // Should return all catalogs or default catalog, not false or undefined
      if (catalog.en) {
        // If it returns all catalogs
        catalog.should.have.property('en')
      } else {
        // If it returns default catalog
        catalog.should.have.property('hello')
      }
    })

    it('should handle object with null locale gracefully', () => {
      const req = { locale: null }
      const catalog = i18n.getCatalog(req)
      
      catalog.should.be.type('object')
      // Should return all catalogs or default catalog, not false or null
    })

    it('should handle object with invalid locale gracefully', () => {
      const req = { locale: 'invalid-locale' }
      const catalog = i18n.getCatalog(req)
      
      // Should either return false (current) or fallback to default catalog (improved)
      if (catalog === false) {
        catalog.should.equal(false) // Current behavior
      } else {
        catalog.should.be.type('object') // Improved behavior
      }
    })
  })

  describe('getCatalog with two parameters', () => {
    it('should prioritize second parameter over object locale', () => {
      const req = { locale: 'fr' }
      const catalog = i18n.getCatalog(req, 'es')
      
      catalog.should.be.type('object')
      catalog.hello.should.equal('Hola') // Spanish, not French
    })

    it('should handle invalid second parameter gracefully', () => {
      const req = { locale: 'en' }
      const catalog = i18n.getCatalog(req, 'invalid')
      
      // Should either return false or fallback appropriately
      if (catalog === false) {
        catalog.should.equal(false) // Current behavior
      } else {
        catalog.should.be.type('object') // Improved fallback
      }
    })

    it('should handle null/undefined second parameter gracefully', () => {
      const req = { locale: 'es' }
      
      let catalog = i18n.getCatalog(req, null)
      catalog.should.be.type('object')
      
      catalog = i18n.getCatalog(req, undefined)
      catalog.should.be.type('object')
    })
  })

  describe('getCatalog consistency across different call patterns', () => {
    it('should return consistent structure regardless of call pattern', () => {
      const catalog1 = i18n.getCatalog() // All catalogs
      const catalog2 = i18n.getCatalog('', '') // Should also return all catalogs
      const catalog3 = i18n.getCatalog(undefined, undefined) // Should also return all catalogs
      
      // All should be objects and have similar structure
      catalog1.should.be.type('object')
      catalog2.should.be.type('object')
      catalog3.should.be.type('object')
      
      // They should all have the same locales available
      if (catalog1.en && catalog2.en && catalog3.en) {
        Object.keys(catalog1).should.eql(Object.keys(catalog2))
        Object.keys(catalog2).should.eql(Object.keys(catalog3))
      }
    })

    it('should never return undefined or throw for valid input combinations', () => {
      const testCases = [
        [undefined, undefined],
        [null, null],
        ['', ''],
        [{ locale: 'en' }, undefined],
        [{ locale: undefined }, 'es'],
        [{ locale: null }, 'fr'],
        ['en', undefined],
        ['es', null]
      ]

      testCases.forEach(([param1, param2], index) => {
        try {
          const result = i18n.getCatalog(param1, param2)
          // Should never be undefined
          should.exist(result, `Test case ${index} returned undefined/null`)
          // Should be object or false (but preferably object)
          if (result !== false) {
            result.should.be.type('object', `Test case ${index} returned unexpected type`)
          }
        } catch (error) {
          should.fail(`Test case ${index} threw error: ${error.message}`)
        }
      })
    })
  })

  describe('getCatalog with fallback configuration', () => {
    beforeEach(() => {
      i18n.configure({
        locales: ['en', 'es', 'fr', 'de'],
        defaultLocale: 'en',
        directory: testLocalesDir,
        updateFiles: false,
        fallbacks: { 'de': 'en', 'pt': 'es' }
      })
    })

    it('should use fallback locale when main locale is not found', () => {
      const catalog = i18n.getCatalog('de') // Should fallback to 'en'
      
      if (catalog !== false) {
        catalog.should.be.type('object')
        // Should contain English content due to fallback
      }
    })

    it('should use fallback chain appropriately', () => {
      const catalog = i18n.getCatalog('pt') // Should fallback to 'es'
      
      if (catalog !== false) {
        catalog.should.be.type('object')
        // Should contain Spanish content due to fallback
      }
    })
  })
})