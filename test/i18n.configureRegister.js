const { I18n } = require('..')
const should = require('should')

describe('configure register', function () {
  it('should work on a custom object', function (done) {
    const customObject = {}
    I18n({
      locales: ['en', 'de'],
      register: customObject
    })
    should.equal(customObject.__('Hello'), 'Hello')
    customObject.setLocale('de')
    should.equal(customObject.__('Hello'), 'Hallo')
    done()
  })

  it('should work on list of objects', function () {
    const obj1 = {}
    const obj2 = {}
    const i18n = new I18n({
      locales: ['en', 'de', 'fr'],
      register: [obj1, obj2]
    })
    should.equal(obj1.__('Hello'), 'Hello')
    should.equal(obj2.__('Hello'), 'Hello')

    // sets both
    i18n.setLocale('fr')
    should.equal(obj1.__('Hello'), 'Bonjour')
    should.equal(obj2.__('Hello'), 'Bonjour')

    // sets both too
    obj1.setLocale('en')
    should.equal(obj1.__('Hello'), 'Hello')
    should.equal(obj2.__('Hello'), 'Hello')

    // sets obj2 only
    i18n.setLocale([obj2], 'de')
    should.equal(obj1.__('Hello'), 'Hello')
    should.equal(obj2.__('Hello'), 'Hallo')

    // sets obj2 only
    i18n.setLocale(obj2, 'fr', true)
    should.equal(obj1.__('Hello'), 'Hello')
    should.equal(obj2.__('Hello'), 'Bonjour')
  })
})
