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
  ],
  matomoLoadDelay: 5000,
  build: {
    terser: false
  },
  hooks: {
    render: {
      before: (server, render) => {
        server.app.use((req, res, next) => {
          if (server.options.matomoLoadDelay && req.originalUrl.endsWith('piwik.js')) {
            setTimeout(next, server.options.matomoLoadDelay)
          } else {
            next()
          }
        })
      }
    }
  }
}
