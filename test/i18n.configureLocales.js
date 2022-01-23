const i18n = require('..')
const should = require('should')
const fs = require('fs')
const path = require('path')

describe('locales configuration', () => {
  it('omitting it should read all directory contents', (done) => {
    const directory = path.join(__dirname, '..', 'locales')

    i18n.configure({
      directory: directory
    })

    const expected = [
      'de',
      'de-AT',
      'de-DE',
      'en',
      'en-GB',
      'en-US',
      'fr',
      'fr-CA',
      'nl',
      'ru',
      'tr-TR'
    ].sort()
    should.deepEqual(i18n.getLocales(), expected)

    done()
  })

  it('should work when using together with prefix', (done) => {
    const directory = path.join(__dirname, '..', 'testlocales')

    fs.mkdirSync(directory)
    fs.writeFileSync(directory + '/.gitkeepornot', 'just kidding')
    fs.writeFileSync(directory + '/app-de.json', '{}')
    fs.writeFileSync(directory + '/app-en.json', '{}')

    i18n.configure({
      directory: directory,
      prefix: 'app-'
    })

    const expected = ['de', 'en'].sort()
    should.deepEqual(i18n.getLocales(), expected)

    fs.unlinkSync(directory + '/.gitkeepornot')
    fs.unlinkSync(directory + '/app-de.json')
    fs.unlinkSync(directory + '/app-en.json')
    fs.rmdirSync(directory)

    done()
  })

  it('should work when using together with prefix and extension', (done) => {
    const directory = path.join(__dirname, '..', 'testlocales')

    fs.mkdirSync(directory)
    fs.writeFileSync(directory + '/app-de.js', '{}')
    fs.writeFileSync(directory + '/app-en.js', '{}')

    i18n.configure({
      directory: directory,
      prefix: 'app-',
      extension: '.js'
    })

    const expected = ['de', 'en'].sort()
    should.deepEqual(i18n.getLocales(), expected)

    fs.unlinkSync(directory + '/app-de.js')
    fs.unlinkSync(directory + '/app-en.js')
    fs.rmdirSync(directory)

    done()
  })

  it('should ignore unmatching files when using together with prefix and extension', (done) => {
    const directory = path.join(__dirname, '..', 'testlocales')

    fs.mkdirSync(directory)
    fs.writeFileSync(directory + '/app-de.js', '{}')
    fs.writeFileSync(directory + '/app-en.js', '{}')
    fs.writeFileSync(directory + '/web-fr.json', '{}')

    i18n.configure({
      directory: directory,
      prefix: 'app-',
      extension: '.js'
    })

    const expected = ['de', 'en'].sort()
    should.deepEqual(i18n.getLocales(), expected)

    fs.unlinkSync(directory + '/app-de.js')
    fs.unlinkSync(directory + '/app-en.js')
    fs.unlinkSync(directory + '/web-fr.json')
    fs.rmdirSync(directory)

    done()
  })
})
