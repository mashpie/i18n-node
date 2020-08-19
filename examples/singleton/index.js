const path = require('path')
const i18n = require('../..')
const one = require('./modules/one')
const two = require('./modules/two')

i18n.configure({
  locales: ['en', 'de'],
  directory: path.join(__dirname, 'locales')
})

// set to german
i18n.setLocale('de')

// will put 'Hallo'
console.log('index.js', i18n.__('Hello'))

// will also put 'Hallo'
one()

// will also put 'Hallo'
two()

// -------------------------------------------------

// set to german
i18n.setLocale('en')

// will put 'Hello'
console.log('index.js', i18n.__('Hello'))

// will also put 'Hello'
one()

// will also put 'Hello'
two()
