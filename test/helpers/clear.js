'use strict';
var fs = require('fs'),
  upath = require('upath')
;
module.exports = function clear(_i18n) {
  var dir = _i18n.directory;
  if (_i18n && _i18n.disableReload) {
    _i18n.disableReload();
  }
  try {
    if (dir && fs.existsSync(dir)) {
      var s = fs.statSync(dir);
      if (s.isDirectory()) {
        (fs.readdirSync(dir) || []).forEach(function (f) {
          fs.unlinkSync(upath.join(dir, f));
        });
        fs.rmdirSync(dir);
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      return error;
    }
  }
}