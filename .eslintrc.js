module.exports = {
  root: true,
  parserOptions: {
    parser: '@babel/eslint-parser',
    sourceType: 'module',
    requireConfigFile: false
  },
  extends: [
    '@nuxtjs'
  ],
  plugins: [
    'jest'
  ],
  rules: {
    'vue/singleline-html-element-content-newline': 'off',
    'no-console': ['error', { allow: ['debug', 'warn'] }]
  }
}
