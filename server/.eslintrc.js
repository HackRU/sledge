module.exports = {
  plugins: ['prettier', 'jest'],
  parser: 'babel-eslint',
  extends: ['airbnb-base'],
  env: {
    browser: true,
    node: true,
    es6: true,
    'jest/globals': true,
  },
  rules: {
    'prettier/prettier': 'error',
  },
};
