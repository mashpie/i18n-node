/**
 * @author      Created by Marcus Spiegel <marcus.spiegel@gmail.com> on 2011-03-25.
 * @link        https://github.com/mashpie/i18n-node
 * @license		http://creativecommons.org/licenses/by-sa/3.0/
 *
 * @version     0.3.0
 */

// dependencies

var vsprintf = require('sprintf').vsprintf, // 0.1.1
    fs = require('fs'),
    path = require('path'),
    
// defaults
    
    locales = {},
    locale = 'en',
    directory = './locales';

// public exports

var i18n = exports;

i18n.version = '0.3.0';

i18n.configure = function(opt){
    if( typeof opt.locales === 'object' ){
        opt.locales.forEach(function(l){
            read(l);
        });
    }
    
    // you may register helpers in global scope, up to you
    if( typeof opt.register === 'object' ){
        opt.register.__ = i18n.__;
        opt.register.__n = i18n.__n;
    }
}

i18n.init = function(request, response, next) { 
    if( typeof request === 'object' ){
        guessLanguage(request);
    }
    if( typeof next === 'function' ){
        next();
    }
};

i18n.__ = function() {
    var msg = translate(arguments[0]);
    if (arguments.length > 1) {
        msg = vsprintf(msg, Array.prototype.slice.call(arguments, 1));
    }
    return msg;
};

i18n.__n = function() {
    var singular = arguments[0];
    var plural = arguments[1];
    var count = arguments[2];
    var msg = translate(singular, plural);

    if (parseInt(count) > 1) {
        msg = vsprintf(msg.other, [count]);
    } else {
        msg = vsprintf(msg.one, [count]);
    }

    if (arguments.length > 3) {
        msg = vsprintf(msg, Array.prototype.slice.call(arguments, 3));
    }

    return msg;
};

i18n.setLocale = function() {
    if (locales[arguments[0]]) {
        locale = arguments[0];
    }
    return i18n.getLocale();
};

i18n.getLocale = function() {
    return locale;
};

// ===================
// = private methods =
// ===================

// guess language setting based on http headers
function guessLanguage(request){
    if(typeof request === 'object'){
        var language_header = request.headers['accept-language'],
        languages = [];
        regions = [];
        request.languages = [locale];
        request.regions = [locale];
        request.language = locale;
        request.region = locale;

        if (language_header) {
            language_header.split(',').forEach(function(l) {
                header = l.split(';', 1)[0];
                lr = header.split('-', 2);
                if (lr[0]) {
                    languages.push(lr[0].toLowerCase());
                }
                if (lr[1]) {
                    regions.push(lr[1].toLowerCase());
                }
            });

            if (languages.length > 0) {
                request.languages = languages;
                request.language = languages[0];
            }

            if (regions.length > 0) {
                request.regions = regions;
                request.region = regions[0];
            }
        }
        i18n.setLocale(request.language);
    }
}

// read locale file, translate a msg and write to fs if new
function translate(singular, plural) {
    if (!locales[locale]) {
        read(locale);
    }

    if (plural) {
        if (!locales[locale][singular]) {
            locales[locale][singular] = {
                'one': singular,
                'other': plural
            };
            write(locale);
        }
    }

    if (!locales[locale][singular]) {
        locales[locale][singular] = singular;
        write(locale);
    }
    return locales[locale][singular];
}

// try reading a file
function read(locale) {
    locales[locale] = {};
    try {
        locales[locale] = JSON.parse(fs.readFileSync(locate(locale)));
    } catch(e) {
        console.log('initializing ' + locate(locale));
        write(locale);
    }
}

// try writing a file in a created directory
function write(locale) {
    try {
        stats = fs.lstatSync(directory);
    } catch(e) {
        fs.mkdirSync(directory, 0755);
    }
    fs.writeFile(locate(locale), JSON.stringify(locales[locale], null, "\t"));
}

// basic normalization of filepath
function locate(locale) {
    return path.normalize(directory + '/' + locale + '.js');
}