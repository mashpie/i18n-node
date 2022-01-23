const { I18n } = require('..')
const should = require('should')
const fs = require('fs')
const path = require('path')

const timeout = 50

/**
 * @todo autoreload... by fs.watch never stops
 * test may timeout when run without --exit. Still this works:
 *
 * $ mocha --exit test/i18n.configureAutoreload.js
 *
 * ...needs a proper shutdown as of https://github.com/mashpie/i18n-node/issues/359
 */

describe('autoreload configuration', () => {
  const testScope = {}
  const directory = path.join(__dirname, '..', 'testlocalesauto')
  fs.mkdirSync(directory)
  fs.writeFileSync(directory + '/de.json', '{}')
  fs.writeFileSync(directory + '/en.json', '{}')
  const i18n = new I18n({
    directory: directory,
    register: testScope,
    autoReload: true
  })

  it('will start with empty catalogs', (done) => {
    should.deepEqual(i18n.getCatalog(), { de: {}, en: {} })
    setTimeout(done, timeout)
  })

  it('reloads when a catalog is altered', (done) => {
    fs.writeFileSync(directory + '/de.json', '{"Hello":"Hallo"}')
    setTimeout(done, timeout)
  })

  it('has added new string to catalog and translates correctly', (done) => {
    i18n.setLocale(testScope, 'de')
    should.equal('Hallo', testScope.__('Hello'))
    should.deepEqual(i18n.getCatalog(), { de: { Hello: 'Hallo' }, en: {} })
    done()
  })

  it('will add new string to catalog and files from __()', (done) => {
    should.equal('Hallo', testScope.__('Hello'))
    should.deepEqual(i18n.getCatalog(), { de: { Hello: 'Hallo' }, en: {} })
    done()
  })

  it('will remove testlocalesauto after tests', (done) => {
    fs.unlinkSync(directory + '/de.json')
    fs.unlinkSync(directory + '/en.json')
    fs.rmdirSync(directory)
    done()
  })
})

describe('autoreload configuration with prefix', () => {
  const testScope = {}
  const directory = path.join(__dirname, '..', 'testlocalesautoprefixed')
  fs.mkdirSync(directory)
  fs.writeFileSync(directory + '/customprefix-de.json', '{}')
  fs.writeFileSync(directory + '/customprefix-en.json', '{}')
  const i18n = new I18n({
    directory: directory,
    register: testScope,
    prefix: 'customprefix-',
    autoReload: true
  })

  it('will start with empty catalogs', (done) => {
    should.deepEqual(i18n.getCatalog(), { de: {}, en: {} })
    setTimeout(done, timeout)
  })

  it('reloads when a catalog is altered', (done) => {
    fs.writeFileSync(directory + '/customprefix-de.json', '{"Hello":"Hallo"}')
    setTimeout(done, timeout)
  })

  it('has added new string to catalog and translates correctly', (done) => {
    i18n.setLocale(testScope, 'de')
    should.equal('Hallo', testScope.__('Hello'))
    should.deepEqual(i18n.getCatalog(), { de: { Hello: 'Hallo' }, en: {} })
    done()
  })

  it('will add new string to catalog and files from __()', (done) => {
    should.equal('Hallo', testScope.__('Hello'))
    should.deepEqual(i18n.getCatalog(), { de: { Hello: 'Hallo' }, en: {} })
    done()
  })

  it('will remove testlocalesautoprefixed after tests', (done) => {
    fs.unlinkSync(directory + '/customprefix-de.json')
    fs.unlinkSync(directory + '/customprefix-en.json')
    fs.rmdirSync(directory)
    done()
  })
})

describe('autoreload configuration with prefix and customextension', () => {
  const testScope = {}
  const directory = path.join(__dirname, '..', 'testlocalesautoprefixedext')
  fs.mkdirSync(directory)
  fs.writeFileSync(directory + '/customprefix-de.customextension', '{}')
  fs.writeFileSync(directory + '/customprefix-en.customextension', '{}')
  const i18n = new I18n({
    directory: directory,
    register: testScope,
    prefix: 'customprefix-',
    extension: '.customextension',
    autoReload: true
  })

  it('will start with empty catalogs', (done) => {
    should.deepEqual(i18n.getCatalog(), { de: {}, en: {} })
    setTimeout(done, timeout)
  })

  it('reloads when a catalog is altered', (done) => {
    fs.writeFileSync(
      directory + '/customprefix-de.customextension',
      '{"Hello":"Hallo"}'
    )
    setTimeout(done, timeout)
  })

  it('has added new string to catalog and translates correctly', (done) => {
    i18n.setLocale(testScope, 'de')
    should.equal('Hallo', testScope.__('Hello'))
    should.deepEqual(i18n.getCatalog(), { de: { Hello: 'Hallo' }, en: {} })
    done()
  })

  it('will add new string to catalog and files from __()', (done) => {
    should.equal('Hallo', testScope.__('Hello'))
    should.deepEqual(i18n.getCatalog(), { de: { Hello: 'Hallo' }, en: {} })
    done()
  })

  it('will remove testlocalesautoprefixed after tests', (done) => {
    fs.unlinkSync(directory + '/customprefix-de.customextension')
    fs.unlinkSync(directory + '/customprefix-en.customextension')
    fs.rmdirSync(directory)
    done()
  })
})

describe('autoreload configuration with customextension', () => {
  const testScope = {}
  const directory = path.join(__dirname, '..', 'testlocalesautocustomextension')
  fs.mkdirSync(directory)
  fs.writeFileSync(directory + '/de.customextension', '{}')
  fs.writeFileSync(directory + '/en.customextension', '{}')
  const i18n = new I18n({
    directory: directory,
    register: testScope,
    extension: '.customextension',
    autoReload: true
  })

  it('will start with empty catalogs', (done) => {
    should.deepEqual(i18n.getCatalog(), { de: {}, en: {} })
    setTimeout(done, timeout)
  })

  it('reloads when a catalog is altered', (done) => {
    fs.writeFileSync(directory + '/de.customextension', '{"Hello":"Hallo"}')
    setTimeout(done, timeout)
  })

  it('has added new string to catalog and translates correctly', (done) => {
    i18n.setLocale(testScope, 'de')
    should.equal('Hallo', testScope.__('Hello'))
    should.deepEqual(i18n.getCatalog(), { de: { Hello: 'Hallo' }, en: {} })
    done()
  })

  it('will add new string to catalog and files from __()', (done) => {
    should.equal('Hallo', testScope.__('Hello'))
    should.deepEqual(i18n.getCatalog(), { de: { Hello: 'Hallo' }, en: {} })
    done()
  })

  it('will remove testlocalesautoprefixed after tests', (done) => {
    fs.unlinkSync(directory + '/de.customextension')
    fs.unlinkSync(directory + '/en.customextension')
    fs.rmdirSync(directory)
    done()
  })
})
