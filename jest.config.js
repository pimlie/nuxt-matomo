module.exports = {
  testEnvironment: 'node',

  collectCoverage: false,
  collectCoverageFrom: ['lib'],

  setupFilesAfterEnv: ['./test/utils/setup']
}
