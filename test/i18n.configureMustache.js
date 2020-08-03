var importFresh = require('import-fresh'),
  i18n1 = importFresh('../i18n'),
  i18n2 = importFresh('../i18n'),
  i18n3 = importFresh('../i18n'),
  i18n4 = importFresh('../i18n'),
  path = require('path'),
  should = require("should");

// cleanup for other tests
delete require.cache[path.resolve('i18n.js')];

describe('mustache configuration', function() {
  const e = should.equal
  const staticCatalog = {
    'en': {
      "Hello {{{name}}}": "Hello {{{name}}}",
      "Hello {{name}}": "Hello {{name}}",
      "Hello <%{name}%>": "Hello <%{name}%>",
      "Hello <%name%>": "Hello <%name%>",
      "Hello **{name}**": "Hello **{name}**",
      "Hello **name**": "Hello **name**",
    }
  }
  const name = 'Pudo & Moka'

  i18n1.configure({ staticCatalog });
  i18n2.configure({ staticCatalog, mustacheConfig: { tags: [ '<%', '%>' ] } });
  i18n3.configure({ staticCatalog, mustacheConfig: { tags: [ '**', '**' ] } });
  i18n4.configure({ staticCatalog, mustacheConfig: { disable: true } });

  it('should parse with defaults', function(done) {
    e(i18n1.__('Hello {{{name}}}', { name }), 'Hello Pudo & Moka')
    e(i18n1.__('Hello {{name}}', { name }), 'Hello Pudo &amp; Moka')
    e(i18n1.__('Hello <%{name}%>', { name }), 'Hello <%{name}%>')
    e(i18n1.__('Hello <%name%>', { name }), 'Hello <%name%>')
    e(i18n1.__('Hello **{name}**', { name }), 'Hello **{name}**')
    e(i18n1.__('Hello **name**', { name }), 'Hello **name**')
    done();
  });

  it('should parse with customTags', function(done) {
    e(i18n2.__('Hello {{{name}}}', { name }), 'Hello {{{name}}}')
    e(i18n2.__('Hello {{name}}', { name }), 'Hello {{name}}')
    e(i18n2.__('Hello <%{name}%>', { name }), 'Hello Pudo & Moka')
    e(i18n2.__('Hello <%name%>', { name }), 'Hello Pudo &amp; Moka')
    e(i18n2.__('Hello **{name}**', { name }), 'Hello **{name}**')
    e(i18n2.__('Hello **name**', { name }), 'Hello **name**')
    done();
  });

  it('should parse with customTags (regex safe)', function(done) {
    e(i18n3.__('Hello {{{name}}}', { name }), 'Hello {{{name}}}')
    e(i18n3.__('Hello {{name}}', { name }), 'Hello {{name}}')
    e(i18n3.__('Hello <%{name}%>', { name }), 'Hello <%{name}%>')
    e(i18n3.__('Hello <%name%>', { name }), 'Hello <%name%>')
    e(i18n3.__('Hello **{name}**', { name }), 'Hello Pudo & Moka')
    e(i18n3.__('Hello **name**', { name }), 'Hello Pudo &amp; Moka')
    done();
  });

  it('should ignore mustache tags when opted-out', function(done) {
    e(i18n4.__('Hello {{{name}}}', { name }), 'Hello {{{name}}}')
    e(i18n4.__('Hello {{name}}', { name }), 'Hello {{name}}')
    e(i18n4.__('Hello <%{name}%>', { name }), 'Hello <%{name}%>')
    e(i18n4.__('Hello <%name%>', { name }), 'Hello <%name%>')
    e(i18n4.__('Hello **{name}**', { name }), 'Hello **{name}**')
    e(i18n4.__('Hello **name**', { name }), 'Hello **name**')
    done();
  });

});
