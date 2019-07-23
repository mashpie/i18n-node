var i18n = require('../i18n'),
    should = require("should"),
    path = require("path");

describe('Locale switching should work when set via custom header', function () {

    var req;
    var res;

    beforeEach(function () {

        i18n.configure({
            locales: ['en', 'de', 'fr', 'tr'],
            defaultLocale: 'en',
            header: 'x-culture',
            directory: './locales'
        });

        req = {
            request: "GET /test",
            url: "/test",
            headers: {
                'accept-language': 'de',
                'x-culture': 'tr'
            }
        };

        res = {
            locals: {}
        };
    });

    it('getLocale should return same locale for req and res based on custom header', function () {
        i18n.init(req, res);

        i18n.getLocale(req).should.equal('tr');
        i18n.getLocale(res).should.equal('tr');

        req.getLocale().should.equal('tr');
        res.getLocale().should.equal('tr');
        res.locals.getLocale().should.equal('tr');

        req.__('Hello').should.equal('Merhaba');
        res.__('Hello').should.equal('Merhaba');
        res.locals.__('Hello').should.equal('Merhaba');
    });
});
