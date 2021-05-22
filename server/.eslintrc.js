module.exports = {
  plugins: ['prettier', 'jest', 'jsdoc'],
  parser: 'babel-eslint',
  extends: ['airbnb-base', 'plugin:jsdoc/recommended'],
  env: {
    browser: true,
    node: true,
    es6: true,
    'jest/globals': true,
  },
  rules: {
    'jsdoc/check-tag-names': [
      'error',
      {
        definedTags: ['swagger'],
      },
    ],
    'linebreak-style': 0,
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
  },
};
