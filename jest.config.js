module.exports = {
  testEnvironment: 'node',

  collectCoverage: false,
  collectCoverageFrom: ['lib'],

  setupFilesAfterEnv: ['./test/utils/setup'],
  transformIgnorePatterns: [
    'node_modules/(?!(get-port)/)'
  ]
}
