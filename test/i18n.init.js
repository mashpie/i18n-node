var i18n = require('../i18n'),
  should = require("should"),
  sinon = require("sinon"),
  fs = require('fs');

describe('i18n.init()', function() {

  var TestScope;
  var UnboundTestScope;
  var UnboundTestScopeWithLocale;
  var TestRequest;
  var TestResponse;
  var next;

  beforeEach(function() {
    TestScope = {
      scope: {
        locale: 'de'
      }
    };
    UnboundTestScope = {
      scope: {
        locale: 'de'
      }
    };
    UnboundTestScopeWithLocale = {
      locale: 'de'
    };
    TestRequest = {
      headers: {
        'accept-language': 'de'
      }
    };
    TestResponse = {};
    next = sinon.spy();
    i18n.configure({
      locales: ['de', 'en'],
      directory: './locales',
      register: TestScope,
      updateFiles: false,
      syncFiles: false
    });
  });

  it('should break silently when called without parameters', function(done) {
    should.equal(i18n.init(), undefined);
    should.equal(TestScope.__('Hello'), 'Hello');
    done();
  });

  it('should break when called without parameters', function(done) {
    should.equal(i18n.init(TestRequest, TestResponse, next), undefined);
    should.equal(TestScope.locale, 'de');
    should.equal(next.called, true);
    should.equal(TestScope.__('Hello'), 'Hallo');
    done();
  });

  it('should be possible to bind to non-request objects', function(done) {
    var plain = new Object();
    should.equal(i18n.init(plain), undefined);
    should.equal(plain.locale, 'en');
    should.equal(plain.__('Hello'), 'Hello');
    should.equal(plain.setLocale('de'), 'de');
    should.equal(plain.__('Hello'), 'Hallo');
    done();
  });

  it('should be possible to bind public methods to foreign objects', function(done){
    UnboundTestScope.translate = i18n.__;
    should.equal(UnboundTestScope.translate('Hello'), 'Hallo');

    UnboundTestScopeWithLocale.translate = i18n.__;
    should.equal(UnboundTestScopeWithLocale.translate('Hello'), 'Hallo');
    done();
  })

});