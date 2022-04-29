module.exports = {
  root: true,

  parserOptions: {
    ecmaVersion: 2018,   // Allows for the parsing of modern ECMAScript features
    sourceType: 'module' // Allows for the use of imports
  },

  env: {
    browser: true,
    es6    : true,
    node   : true
  },

  // Rules order is important, please avoid shuffling them
  extends: [
    'eslint:recommended',
    //'prettier'
  ],

  plugins: [
  ],

  globals: {
    process: 'readonly',
  },

  // add your custom rules here
  rules: {
    'prefer-promise-reject-errors': 'off',
    'no-unused-vars': 'warn',
    'quotes': ['warn', 'single'],
    // allow debugger during development only
    'key-spacing': ['warn', {
      'mode': 'minimun',
    }],
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
