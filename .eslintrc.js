module.exports = {
  root: true,
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false
  },
  overrides: [
    {
      files: ['*.json'],
      parser: 'jsonc-eslint-parser'
    }
  ],
  extends: [
    '@nuxtjs',
    'plugin:jsonc/recommended-with-json'
  ],
  plugins: [
    'jest'
  ],
  rules: {
    'vue/singleline-html-element-content-newline': 'off',
    'no-console': ['error', { allow: ['debug', 'warn'] }]
  }
}
