var i18n = require('../i18n'),
  should = require("should"),
  sinon = require("sinon"),
  fs = require('fs');

describe('i18n.init()', function() {

  var TestScope;
  var TestRequest;
  var TestResponse;
  var next;

  beforeEach(function() {
    TestScope = {};
    TestRequest = {
      headers: {
        'accept-language': 'en'
      }
    };
    TestResponse = {};
    next = sinon.spy();
    i18n.configure({
      locales: ['de', 'en'],
      register: TestScope,
      updateFiles: false,
      syncFiles: false
    });
  });

  it('should break silently when called without parameters', function(done) {
    should.equal(i18n.init(), undefined);
    done();
  });

  it('should break when called without parameters', function(done) {
    should.equal(i18n.init(TestRequest, TestResponse, next), undefined);
    should.equal(TestScope.locale, 'en');
    should.equal(next.called, true);
    done();
  });

});