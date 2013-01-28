/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

var i18n = require('../i18n'),
    should = require("should");

i18n.configure({
  locales: ['en', 'de'],
  register: global
});


describe('module setup', function () {
  it('the version should be set', function () {
    should.equal(i18n.version, '0.3.7');
  });
});

describe('module api', function () {

  var req = {
    "request": "GET /test",
    __: i18n.__
  };

  describe('setLocal and getLocale', function () {
    it('getLocale should return default setting', function () {
      i18n.getLocale().should.equal('en');
    });

    it('setLocale should return the new setting', function () {
      i18n.setLocale('de').should.equal('de');
    });

    it('and getLocale should return the new setting', function () {
      i18n.getLocale().should.equal('de');
    });

    it('should return the current local setting, when used with 2 args', function () {
      i18n.setLocale(req, 'en').should.equal('en');
    });

    it('while getLocale should still return the previous global setting', function () {
      i18n.getLocale().should.equal('de');
    });

    it('now getLocale should return local locale when used with local object as 1st arg', function () {
      i18n.getLocale(req).should.equal('en');
    });
  });

  describe('translating singulars', function () {
    it('should return en translations as expected', function () {
      i18n.setLocale('en');
      should.equal(__('Hello'), 'Hello');
      should.equal(__('Hello %s, how are you today?', 'Marcus'), 'Hello Marcus, how are you today?');
      should.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Hello Marcus, how are you today? How was your weekend.');
    });

    it('and should return de translations as expected', function () {
      i18n.setLocale('de');
      should.equal(__('Hello'), 'Hallo');
      should.equal(__('Hello %s, how are you today?', 'Marcus'), 'Hallo Marcus, wie geht es dir heute?');
      should.equal(__('Hello %s, how are you today? How was your %s.', 'Marcus', __('weekend')), 'Hallo Marcus, wie geht es dir heute? Wie war dein Wochenende.');
    });
  });

  describe('translating in scopes (ie.: request)', function(){
    it('has to use local translation in en', function(){
      i18n.setLocale(req, 'en').should.equal('en');
      req.__('Hello').should.equal('Hello');
    });

    it('while the global translation remains untouched', function(){
      should.equal(__('Hello'), 'Hallo');
    });

    it('and has to use local translation in de', function(){
      i18n.setLocale(req, 'de').should.equal('de');
      req.__('Hello').should.equal('Hallo');
    });

    it('still the global translation remains untouched', function(){
      should.equal(__('Hello'), 'Hallo');
    });
  });

  describe('translating basic plurals', function(){
    it('should work as expected (to lazy to change from expresso)', function(){
      i18n.setLocale('en');
      var singular = __n('%s cat', '%s cats', 1),
          plural = __n('%s cat', '%s cats', 3);
      should.equal(singular, '1 cat');
      should.equal(plural, '3 cats');

      i18n.setLocale('de');
      singular = __n('%s cat', '%s cats', 1);
      plural = __n('%s cat', '%s cats', 3);
      should.equal(singular, '1 Katze');
      should.equal(plural, '3 Katzen');
    });
  });

  describe('translating nested plurals', function(){
    it('should work as expected (to lazy to change from expresso)', function(){
      i18n.setLocale('en');
      var singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, __('tree')),
          plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, __('tree'));
      should.equal(singular, 'There is one monkey in the tree');
      should.equal(plural, 'There are 3 monkeys in the tree');

      i18n.setLocale('de');
      singular = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 1, __('tree'));
      plural = __n('There is one monkey in the %%s', 'There are %d monkeys in the %%s', 3, __('tree'));
      should.equal(singular, 'Im Baum sitzt ein Affe');
      should.equal(plural, 'Im Baum sitzen 3 Affen');
    });
  });

  describe('translating variables values', function(){
    it('should work as expected (to lazy to change from expresso)', function(){
      var i = 0,
          greetings = ['Hi', 'Hello', 'Howdy'],
          greetingsDE = ['Hi', 'Hallo', 'Hallöchen'];

      i18n.setLocale('en');
      for (i = 0; i < greetings.length; i++) {
        should.equal(greetings[i], __(greetings[i]));
      }

      i18n.setLocale('de');
      for (i = 0; i < greetings.length; i++) {
        should.equal(greetingsDE[i], __(greetings[i]));
      }
    });
  });
});
