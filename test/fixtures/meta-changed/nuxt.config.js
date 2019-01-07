module.exports = {
  rootDir: __dirname,
  dev: false,
  modules: [
    ['@/../../../', {
      onMetaChange: true,
      debug: true,
      siteId: 2,
      matomoUrl: './'
    }]
  ]
}
