const i18n = require('..')
const should = require('should')

describe('staticCatalog configuration', () => {
  it('should take locales from static catalog if set', (done) => {
    i18n.configure({
      staticCatalog: {
        en: {}
      }
    })

    const expected = ['en'].sort()
    should.deepEqual(i18n.getLocales(), expected)

    done()
  })

  it('should use static locale definitions from static catalog if set', (done) => {
    i18n.configure({
      staticCatalog: {
        en: {}
      }
    })

    const expected = {}
    should.deepEqual(i18n.getCatalog('en'), expected)

    done()
  })
})
