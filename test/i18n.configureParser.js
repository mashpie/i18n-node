const i18n = require('..')
const should = require('should')
const YAML = require('yaml')

describe('configure parser', function () {
  context('with YAML parser', () => {
    i18n.configure({
      locales: ['en', 'de'],
      parser: YAML
    })

    it('should parse the locale files with the YAML parser', function () {
      should.equal(i18n.__('Hello'), 'Hello')
    })

    it('should write unknown keys to the catalog', function () {
      i18n.__('does.not.exist')

      var catalog = i18n.getCatalog()
      catalog.should.have.property('does.not.exist', 'does.not.exist')
    })
  })
})
