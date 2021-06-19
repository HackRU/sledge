module.exports = {
  plugins: ['prettier', 'jest', 'jsdoc'],
  parser: 'babel-eslint',
  extends: ['airbnb-base', 'plugin:jsdoc/recommended', 'prettier'],
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
        definedTags: ['swagger'], // Allows us to use the custom @swagger tag at the beginning of our Swagger-JSDoc comments
      },
    ],
    'linebreak-style': 0,
    'prettier/prettier': ['error', { endOfLine: 'auto' }],
  },
};
