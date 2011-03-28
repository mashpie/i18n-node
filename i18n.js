/**
 * @author      Created by Marcus Spiegel <marcus.spiegel@gmail.com> on 2011-03-25.
 * @link        https://github.com/mashpie/i18n-node
 * @license		http://creativecommons.org/licenses/by-sa/3.0/
 *
 * @version     0.0.2a
 */

// dependencies
var vsprintf  = require('sprintf').vsprintf, // 0.1.1
    fs        = require('fs'),
    path      = require('path'),
    locales   = {},
    locale    = 'en',
    directory = './locales';

// public export
var i18n = exports;

i18n.version = '0.1.0';

i18n.__ = function() {
    var msg = translate(arguments[0]);
    if (arguments.length > 1) {
        msg = vsprintf(msg, Array.prototype.slice.call(arguments, 1));
    }
    return msg;
};

i18n.__n = function() {
    var singular = arguments[0];
    var plural   = arguments[1];
    var count    = arguments[2];
    var msg      = translate(singular, plural);

    if(parseInt(count) > 1){
        msg = vsprintf(msg.other, [count]);
    }else{
        msg = vsprintf(msg.one, [count]);
    }
    
    if (arguments.length > 3) {
        msg = vsprintf(msg, Array.prototype.slice.call(arguments, 3));
    }
    
    return msg;
}

i18n.setLocale = function() {
    locale = arguments[0];
    return i18n.getLocale();
};

i18n.getLocale = function() {
    return locale;
};

// ===================
// = private methods =
// ===================

// read locale file, translate a msg and write to fs if new
function translate(singular, plural) {
    if (!locales[locale]) {
        read(locale);
    }
    
    if(plural){
        if (!locales[locale][singular]) {
            locales[locale][singular] = {'one':singular, 'other':plural};
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
        console.log('initializing '+locate(locale));
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
function locate(locale){
    return path.normalize(directory + '/' + locale + '.js');
}