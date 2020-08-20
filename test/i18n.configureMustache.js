const { I18n } = require('..')
const should = require('should')

describe('mustache configuration', function () {
  const e = should.equal
  const staticCatalog = {
    en: {
      'Hello {{{name}}}': 'Hello {{{name}}}',
      'Hello {{name}}': 'Hello {{name}}',
      'Hello <%{name}%>': 'Hello <%{name}%>',
      'Hello <%name%>': 'Hello <%name%>',
      'Hello **{name}**': 'Hello **{name}**',
      'Hello **name**': 'Hello **name**'
    }
  }
  const name = 'Pudo & Moka'

  const i18n1 = new I18n({ staticCatalog })
  const i18n2 = new I18n({
    staticCatalog,
    mustacheConfig: { tags: ['<%', '%>'] }
  })
  const i18n3 = new I18n({
    staticCatalog,
    mustacheConfig: { tags: ['**', '**'] }
  })
  const i18n4 = new I18n({ staticCatalog, mustacheConfig: { disable: true } })

  it('should parse with defaults', function (done) {
    e(i18n1.__('Hello {{{name}}}', { name }), 'Hello Pudo & Moka')
    e(i18n1.__('Hello {{name}}', { name }), 'Hello Pudo &amp; Moka')
    e(i18n1.__('Hello <%{name}%>', { name }), 'Hello <%{name}%>')
    e(i18n1.__('Hello <%name%>', { name }), 'Hello <%name%>')
    e(i18n1.__('Hello **{name}**', { name }), 'Hello **{name}**')
    e(i18n1.__('Hello **name**', { name }), 'Hello **name**')
    done()
  })

  it('should parse with customTags', function (done) {
    e(i18n2.__('Hello {{{name}}}', { name }), 'Hello {{{name}}}')
    e(i18n2.__('Hello {{name}}', { name }), 'Hello {{name}}')
    e(i18n2.__('Hello <%{name}%>', { name }), 'Hello Pudo & Moka')
    e(i18n2.__('Hello <%name%>', { name }), 'Hello Pudo &amp; Moka')
    e(i18n2.__('Hello **{name}**', { name }), 'Hello **{name}**')
    e(i18n2.__('Hello **name**', { name }), 'Hello **name**')
    done()
  })

  it('should parse with customTags (regex safe)', function (done) {
    e(i18n3.__('Hello {{{name}}}', { name }), 'Hello {{{name}}}')
    e(i18n3.__('Hello {{name}}', { name }), 'Hello {{name}}')
    e(i18n3.__('Hello <%{name}%>', { name }), 'Hello <%{name}%>')
    e(i18n3.__('Hello <%name%>', { name }), 'Hello <%name%>')
    e(i18n3.__('Hello **{name}**', { name }), 'Hello Pudo & Moka')
    e(i18n3.__('Hello **name**', { name }), 'Hello Pudo &amp; Moka')
    done()
  })

  it('should ignore mustache tags when opted-out', function (done) {
    e(i18n4.__('Hello {{{name}}}', { name }), 'Hello {{{name}}}')
    e(i18n4.__('Hello {{name}}', { name }), 'Hello {{name}}')
    e(i18n4.__('Hello <%{name}%>', { name }), 'Hello <%{name}%>')
    e(i18n4.__('Hello <%name%>', { name }), 'Hello <%name%>')
    e(i18n4.__('Hello **{name}**', { name }), 'Hello **{name}**')
    e(i18n4.__('Hello **name**', { name }), 'Hello **name**')
    done()
  })
})
