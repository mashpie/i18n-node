const i18n = require('..')
const should = require('should')

describe('parsing Messageformat phrases', () => {
  const mfTest = {}

  beforeEach(() => {
    i18n.configure({
      locales: ['en', 'de', 'fr', 'ru'],
      register: mfTest,
      directory: './locales',
      updateFiles: false,
      objectNotation: true
    })
  })

  it('should work with simple strings', () => {
    mfTest.setLocale('en')
    should.equal('Hello', mfTest.__mf('Hello'))

    mfTest.setLocale('de')
    should.equal('Hallo', mfTest.__mf('Hello'))
    should.equal('Hallo', mfTest.__mf('Hello'))
    should.equal(
      'Hallo Marcus, wie geht es dir heute?',
      mfTest.__mf('Hello %s, how are you today?', 'Marcus')
    )
    should.equal('Hello', i18n.__mf({ phrase: 'Hello', locale: 'en' }))
    should.equal('Hello', mfTest.__mf({ phrase: 'Hello', locale: 'en' }))
  })

  it('should work with basic replacements', () => {
    mfTest.setLocale('en')
    should.equal(
      'Hello Marcus',
      mfTest.__mf('Hello {name}', { name: 'Marcus' })
    )

    mfTest.setLocale('de')
    should.equal(
      'Hallo Marcus',
      mfTest.__mf('Hello {name}', { name: 'Marcus' })
    )
    should.equal(
      'Hallo Marcus, wie war dein test?',
      mfTest.__mf('Hello {name}, how was your %s?', 'test', { name: 'Marcus' })
    )
  })

  it('should work with plurals', () => {
    /**
     * en: "mftest": "In {lang} there {NUM, plural,one{is one for #}other{others for #}}"
     */
    mfTest.setLocale('en')
    should.equal(
      'In english there others for 0',
      mfTest.__mf('mftest', { NUM: 0, lang: 'english' })
    )
    should.equal(
      'In english there is one for 1',
      mfTest.__mf('mftest', { NUM: 1, lang: 'english' })
    )
    should.equal(
      'In english there others for 2',
      mfTest.__mf('mftest', { NUM: 2, lang: 'english' })
    )
    should.equal(
      'In english there others for 3',
      mfTest.__mf('mftest', { NUM: 3, lang: 'english' })
    )
    should.equal(
      'In english there others for 4',
      mfTest.__mf('mftest', { NUM: 4, lang: 'english' })
    )
    should.equal(
      'In english there others for 5',
      mfTest.__mf('mftest', { NUM: 5, lang: 'english' })
    )
    should.equal(
      'In english there others for 6',
      mfTest.__mf('mftest', { NUM: 6, lang: 'english' })
    )

    /**
     * de: "mftest": "In {lang} there {NUM, plural,one{is one for #}other{others for #}}"
     */
    mfTest.setLocale('de')
    should.equal(
      'In german there others for 0',
      mfTest.__mf('mftest', { NUM: 0, lang: 'german' })
    )
    should.equal(
      'In german there is one for 1',
      mfTest.__mf('mftest', { NUM: 1, lang: 'german' })
    )
    should.equal(
      'In german there others for 2',
      mfTest.__mf('mftest', { NUM: 2, lang: 'german' })
    )
    should.equal(
      'In german there others for 3',
      mfTest.__mf('mftest', { NUM: 3, lang: 'german' })
    )
    should.equal(
      'In german there others for 4',
      mfTest.__mf('mftest', { NUM: 4, lang: 'german' })
    )
    should.equal(
      'In german there others for 5',
      mfTest.__mf('mftest', { NUM: 5, lang: 'german' })
    )
    should.equal(
      'In german there others for 6',
      mfTest.__mf('mftest', { NUM: 6, lang: 'german' })
    )

    /**
     * fr: "mftest": "In {lang} there {NUM, plural,one{is one for #}other{others for #}}"
     */
    mfTest.setLocale('fr')
    should.equal(
      'In french there is one for 0',
      mfTest.__mf('mftest', { NUM: 0, lang: 'french' })
    )
    should.equal(
      'In french there is one for 1',
      mfTest.__mf('mftest', { NUM: 1, lang: 'french' })
    )
    should.equal(
      'In french there others for 2',
      mfTest.__mf('mftest', { NUM: 2, lang: 'french' })
    )
    should.equal(
      'In french there others for 3',
      mfTest.__mf('mftest', { NUM: 3, lang: 'french' })
    )
    should.equal(
      'In french there others for 4',
      mfTest.__mf('mftest', { NUM: 4, lang: 'french' })
    )
    should.equal(
      'In french there others for 5',
      mfTest.__mf('mftest', { NUM: 5, lang: 'french' })
    )
    should.equal(
      'In french there others for 6',
      mfTest.__mf('mftest', { NUM: 6, lang: 'french' })
    )

    /**
     * ru: "mftest": "In {lang} there {NUM, plural,one{is one for #}few{are a few for #}many{are many for #}other{others for #}}"
     */
    mfTest.setLocale('ru')
    should.equal(
      'In russian there are many for 0',
      mfTest.__mf('mftest', { NUM: 0, lang: 'russian' })
    )
    should.equal(
      'In russian there is one for 1',
      mfTest.__mf('mftest', { NUM: 1, lang: 'russian' })
    )
    should.equal(
      'In russian there are a few for 2',
      mfTest.__mf('mftest', { NUM: 2, lang: 'russian' })
    )
    should.equal(
      'In russian there are a few for 3',
      mfTest.__mf('mftest', { NUM: 3, lang: 'russian' })
    )
    should.equal(
      'In russian there are a few for 4',
      mfTest.__mf('mftest', { NUM: 4, lang: 'russian' })
    )
    should.equal(
      'In russian there are many for 5',
      mfTest.__mf('mftest', { NUM: 5, lang: 'russian' })
    )
    should.equal(
      'In russian there are many for 6',
      mfTest.__mf('mftest', { NUM: 6, lang: 'russian' })
    )
    should.equal(
      'In russian there is one for 21',
      mfTest.__mf('mftest', { NUM: 21, lang: 'russian' })
    )
  })
})
