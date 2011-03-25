/**
 * @author      Created by Marcus Spiegel <marcus.spiegel@gmail.com> on 2011-03-25.
 * @link        https://github.com/mashpie/i18n-node
 * @license		http://creativecommons.org/licenses/by-sa/3.0/
 *
 * @version     0.0.1a
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

i18n.__ = function() {
    var msg = translate(arguments[0]);
    if (arguments.length > 1) {
        msg = vsprintf(msg, Array.prototype.slice.call(arguments, 1));
    }
    return msg;
};

// ===================
// = private methods =
// ===================

// read locale file, translate a msg and write to fs if new
function translate(msg) {
    if (!locales[locale]) {
        read(locale);
    }
    if (!locales[locale][msg]) {
        locales[locale][msg] = msg;
        write(locale);
    }
    return locales[locale][msg];
}

// try reading a file
function read(locale) {
    locales[locale] = {};
    try {
        locales[locale] = JSON.parse(fs.readFileSync(locate(locale)));
    } catch(e) {
        console.log('error reading locale for "'+locale+'": ' + e);
    }
}

// try writing a file in a created directory
function write(locale) {
    try {
        stats = fs.lstatSync(directory);
    } catch(e) {
        fs.mkdirSync(directory, 0755);
    }
    fs.writeFile(locate(locale), JSON.stringify(locales[locale]));
}

// basic normalization of filepath
function locate(locale){
    return path.normalize(directory + '/' + locale + '.js');
}