const i18n = require('..')
const should = require('should')
const fs = require('fs')

const isWin = /^win/.test(process.platform)

describe('Module Config (directoryPermissions)', function () {
  const testScope = {}

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

  it('should be possible to setup a custom directory with default permissions', function () {
    i18n.configure({
      locales: ['en', 'de'],
      register: testScope,
      directory: './customlocales',
      extension: '.customextension',
      prefix: 'customprefix-'
    })
    testScope.__('Hello')
    const stat = fs.lstatSync('./customlocales')
    should.exist(stat)
  })

  it('should be possible to setup a custom directory with customized permissions', function () {
    i18n.configure({
      locales: ['en', 'de'],
      register: testScope,
      directoryPermissions: '700',
      directory: './customlocales',
      extension: '.customextension',
      prefix: 'customprefix-'
    })
    testScope.__('Hello')
    const stat = fs.lstatSync('./customlocales')
    const mode = isWin ? '40666' : '40700'
    should.equal(mode, parseInt(stat.mode.toString(8), 10))
    should.exist(stat)
  })

  it('should be possible to setup a custom directory with customized permissions', function () {
    i18n.configure({
      locales: ['en', 'de'],
      register: testScope,
      directoryPermissions: '750',
      directory: './customlocales',
      extension: '.customextension',
      prefix: 'customprefix-'
    })
    testScope.__('Hello')
    const stat = fs.lstatSync('./customlocales')
    const mode = isWin ? '40666' : '40750'
    should.equal(mode, parseInt(stat.mode.toString(8), 10))
    should.exist(stat)
  })
})
