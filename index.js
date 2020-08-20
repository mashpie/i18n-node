const i18n = require('./i18n')

/**
 * defaults to singleton, backward compat
 */
module.exports = i18n()

/**
 * exports constructor with capital letter
 */
module.exports.I18n = i18n
