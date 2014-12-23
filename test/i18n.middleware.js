/*jslint nomen: true, undef: true, sloppy: true, white: true, stupid: true, passfail: false, node: true, plusplus: true, indent: 2 */

// now with coverage suport
var should = require("should");



describe('Basic Middleware', function () {
  it('should convert lists', function () {
    var i18n = process.env.EXPRESS_COV ? require('../i18n-cov') : require('../i18n');

    i18n.configure({
      locales: ['en', 'de'],
      directory: './locales',
      register: global,
      middleware: [i18n.joinArrays]
    });

    i18n.setLocale('en');
    should.equal(__('%s', ['one']), 'one');
    should.equal(__('%s', ['one', 'two']), 'one and two');
    should.equal(__('%s', ['one', 'two', 'three']), 'one, two, and three');

    should.equal(__('You must fill in a value for your %s', ['email', 'password']), 'You must fill in a value for your email and password');

    var oneFile = ['poster'], twoFiles = ['poster', 'report'];
    should.equal(__n('Uploaded the file %%s', 'Uploaded %d files: %%s', oneFile.length, oneFile), 'Uploaded the file poster');
    should.equal(__n('Uploaded the file %%s', 'Uploaded %d files: %%s', twoFiles.length, twoFiles), 'Uploaded 2 files: poster and report');
  });
});
