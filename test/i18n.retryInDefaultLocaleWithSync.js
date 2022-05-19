const { I18n } = require('..')
const should = require('should')
const fs = require('fs')

describe('retryInDefaultLocaleWithSync', () => {
  const DIRECTORY = './locales_in_sync'
  const CONFIG = {
    locales: ['en', 'de'],
    directory: DIRECTORY,
    defaultLocale: 'en',
    retryInDefaultLocale: true,
    syncFiles: true
  }

  const readJson = (locale) => {
    return JSON.parse(fs.readFileSync(`${DIRECTORY}/${locale}.json`))
  }

  const writeJson = (locale, data) => {
    fs.writeFileSync(
      `${DIRECTORY}/${locale}.json`,
      JSON.stringify(data, null, '\t')
    )
  }

  describe('writing', () => {
    const i18n = new I18n(CONFIG)
    const req = {}
    i18n.init(req)
    after(() => {
      try {
        fs.unlinkSync(`${DIRECTORY}/de.json`)
        fs.unlinkSync(`${DIRECTORY}/en.json`)
        fs.rmdirSync(DIRECTORY)
      } catch (e) {}
    })

    it('should not throw', () => {
      req.setLocale('en')
      should.equal(req.__('test'), 'test')

      req.setLocale('de')
      should.equal(req.__('test'), 'test')

      req.setLocale('fr')
      should.equal(req.__('test'), 'test')
    })

    it('should have written all files', () => {
      const statsen = fs.lstatSync(`${DIRECTORY}/en.json`)
      const statsde = fs.lstatSync(`${DIRECTORY}/de.json`)
      should.exist(statsen)
      should.exist(statsde)
    })

    it('should not have written unsupported locale files', () => {
      let statsfr
      try {
        statsfr = fs.lstatSync(`${DIRECTORY}/fr.json`)
      } catch (e) {
        should.equal(e.code, 'ENOENT')
      }
      should.not.exist(statsfr)
    })

    it('should have written same data to all files', () => {
      const dataEn = readJson('en')
      const dataDe = readJson('de')
      should.deepEqual(dataEn, dataDe)
    })
  })

  describe('reading', () => {
    writeJson('en', { test: 'test', welcome: 'welcome' })
    writeJson('de', { test: 'test', welcome: 'Willkommen' })
    const i18n = new I18n(CONFIG)
    const req = {}
    i18n.init(req)
    after(() => {
      try {
        fs.unlinkSync(`${DIRECTORY}/de.json`)
        fs.unlinkSync(`${DIRECTORY}/en.json`)
        fs.rmdirSync(DIRECTORY)
      } catch (e) {}
    })

    it('should still return default locales value', () => {
      req.setLocale('en')
      should.equal(req.__('test'), 'test')
      should.equal(req.__('welcome'), 'welcome')

      req.setLocale('de')
      should.equal(req.__('test'), 'test')
      should.equal(req.__('welcome'), 'Willkommen')

      req.setLocale('fr')
      should.equal(req.__('test'), 'test')
      should.equal(req.__('welcome'), 'welcome')
    })
  })
})
