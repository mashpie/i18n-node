module.exports = function reconfigure(i18nFilename, config) {
  'use strict';
  var i18n, _i18n = require.cache[i18nFilename];
  if (_i18n) {
    try {require.cache[i18nFilename].exports.disableReload();}
    catch (err) { }
    delete require.cache[i18nFilename];
  }
  i18n = require(i18nFilename);
  i18n.configure(config);
  return i18n;
};