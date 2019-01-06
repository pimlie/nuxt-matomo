module.exports = {
  rootDir: __dirname,
  dev: false,
  router: {
    middleware: 'matomo'
  },
  modules: [
    ['@/../../lib/module', {
      debug: true,
      siteId: 1,
      matomoUrl: './'
    }]
  ]
}
