var app = require('./index')
var request = require('supertest')
var fs = require('fs')
var should = require('should')
var path = require('path')

var DE = request(app)
var EN = request(app)

var file = path.join(__dirname, 'locales/en.json')
var content = JSON.parse(fs.readFileSync(file))

describe('autoreload', function () {
  it('should give current translations in EN', function (done) {
    EN.get('/test/')
      .set('accept-language', 'en')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        should.equal(res.text, 'Hello')
        done()
      })
  })

  it('should give current translations in DE', function (done) {
    DE.get('/test/')
      .set('accept-language', 'de')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        should.equal(res.text, 'Hallo')
        done()
      })
  })

  it('should trigger reload of translations in EN', function (done) {
    content.Hello = 'Hi'
    fs.writeFileSync(file, JSON.stringify(content, null, '\t'), 'utf8')
    setTimeout(done, 100)
  })

  it('should give updated translations in EN', function (done) {
    EN.get('/test/')
      .set('accept-language', 'en')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        should.equal(res.text, 'Hi')
        done()
      })
  })

  it('should still give old translations in DE', function (done) {
    DE.get('/test/')
      .set('accept-language', 'de')
      .expect(200)
      .end(function (err, res) {
        if (err) return done(err)
        should.equal(res.text, 'Hallo')
        done()
      })
  })

  it('should reset en.json', function (done) {
    content.Hello = 'Hello'
    fs.writeFileSync(file, JSON.stringify(content, null, '\t'), 'utf8')
    done()
  })
})
