module.exports = {
  rootDir: __dirname,
  dev: false,
  router: {
    middleware: 'matomo'
  },
  modules: [
    ['@/../../../', {
      debug: true,
      siteId: 1,
      matomoUrl: './'
    }]
  ]
}
