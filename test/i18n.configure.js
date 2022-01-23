const i18n = require('..')
const should = require('should')
const fs = require('fs')

describe('Module Config', function () {
  const testScope = {}

  beforeEach(function () {
    i18n.configure({
      locales: ['en', 'de'],
      register: testScope,
      directory: './customlocales',
      extension: '.customextension',
      prefix: 'customprefix-'
    })
    testScope.__('Hello')
  })

  afterEach(function () {
    const stats = fs.lstatSync('./customlocales')
    should.exist(stats)
    if (stats) {
      try {
        fs.unlinkSync('./customlocales/customprefix-de.customextension')
        fs.unlinkSync('./customlocales/customprefix-en.customextension')
        fs.rmdirSync('./customlocales')
      } catch (e) {}
    }
  })

  it('should be possible to setup a custom directory', function () {
    const stats = fs.lstatSync('./customlocales')
    should.exist(stats)
  })

  it('should be possible to read custom files with custom prefixes and extensions', function () {
    const statsde = fs.lstatSync(
      './customlocales/customprefix-de.customextension'
    )
    const statsen = fs.lstatSync(
      './customlocales/customprefix-en.customextension'
    )
    should.exist(statsde)
    should.exist(statsen)
  })
})
