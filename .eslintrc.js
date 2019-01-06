module.exports = {
  "root": true,
  "parserOptions": {
    "parser": "babel-eslint",
    "sourceType": "module"
  },
  "extends": [
    "@nuxtjs"
  ],
  rules: {
    'vue/singleline-html-element-content-newline': 'off',
    'no-console': ['error', { allow: ['debug'] }]
  }
}
