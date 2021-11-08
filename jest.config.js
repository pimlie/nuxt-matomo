module.exports = {
  testEnvironment: 'node',

  collectCoverage: false,
  collectCoverageFrom: ['lib'],

  setupFilesAfterEnv: ['./test/utils/setup'],
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(get-port)/)'
  ]
}
