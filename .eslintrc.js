module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['standard', 'plugin:prettier/recommended'],
  rules: {
    'generator-star-spacing': 'off',
    'space-before-function-paren': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
