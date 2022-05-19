const { I18n } = require('..')
const YAML = require('yaml')
require('should')

describe('configure parser', function () {
  context('with YAML parser', function () {
    const i18n = new I18n({
      locales: ['en'],
      extension: '.yml',
      parser: YAML
    })

    it('should parse the locale files with the YAML parser', function () {
      i18n.__('Hello').should.equal('Hello')
    })

    it('should write unknown keys to the catalog', function () {
      i18n.__('does.not.exist')

      const catalog = i18n.getCatalog()
      catalog.should.have.property('en')
      catalog.en.should.have.property('does.not.exist', 'does.not.exist')
    })
  })
})
