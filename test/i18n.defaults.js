const i18n = require('..')
const should = require('should')
const fs = require('fs')

describe('Module Defaults', () => {
  const testScope = {}

  beforeEach(() => {
    i18n.configure({
      locales: ['en', 'de'],
      register: testScope,
      directory: './defaultlocales'
    })
    testScope.__('Hello')
  })

  afterEach(() => {
    const stats = fs.lstatSync('./defaultlocales')
    should.exist(stats)
    if (stats) {
      try {
        fs.unlinkSync('./defaultlocales/de.json')
        fs.unlinkSync('./defaultlocales/en.json')
        fs.rmdirSync('./defaultlocales')
      } catch (e) {}
    }
  })

  it('should be possible to setup a custom directory', () => {
    const stats = fs.lstatSync('./defaultlocales')
    should.exist(stats)
  })

  it('should be possible to read custom files with default a extension of .json (issue #16)', () => {
    const statsde = fs.lstatSync('./defaultlocales/de.json')
    const statsen = fs.lstatSync('./defaultlocales/en.json')
    should.exist(statsde)
    should.exist(statsen)
  })
})
