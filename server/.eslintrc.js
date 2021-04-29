module.exports = {
  plugins: ['prettier', 'jest'],
  parser: 'babel-eslint',
  extends: ['airbnb'],
  env: {
    browser: true,
    es6: true,
    'jest/globals': true,
  },
  rules: {
    'prettier/prettier': 'warn',
  },
  settings: {
    // gets rid of annoying warning even though this backend doesn't event use React.js
    react: {
      version: 'latest',
    },
  },
};
