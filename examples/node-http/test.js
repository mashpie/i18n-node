var app = require('./index')
var request = require('supertest')
var visitLinks = require('../testlib/visitlinks')

var DE = request(app)
var EN = request(app)

describe('Using res.__() in a plain node.js setup http server to handle concurrent request correctly', function () {
  describe('serial requests', function () {
    visitLinks('series', 'test', EN, 'Hello', DE, 'Hallo')
  })

  describe('parallel requests', function () {
    visitLinks('parallel', 'test', EN, 'Hello', DE, 'Hallo')
  })
})
