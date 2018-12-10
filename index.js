const path = require('path')

module.exports = function nuxtMatomo (options) {
  // Don't include on dev mode
  if (this.options.dev && process.env.NODE_ENV !== 'production') {
    return
  }

  // Add matomo script to head
  let configJs = "window['_paq'] = [];"
  configJs += "window['_paq'].push(['setTrackerUrl', '" + (options.trackerUrl || (options.matomoUrl || options.piwikUrl) + 'piwik.php') + "']);"
  configJs += "window['_paq'].push(['setSiteId', '" + options.siteId + "']);"

  if (options.cookies === false) {
    configJs += "window['_paq'].push(['disableCookies']);"
  }

  if (typeof (this.options.head.__dangerouslyDisableSanitizersByTagID) === 'undefined') {
    this.options.head.__dangerouslyDisableSanitizersByTagID = {}
  }
  this.options.head.__dangerouslyDisableSanitizersByTagID['nuxt-matomo-js'] = ['innerHTML']
  this.options.head.script.push({
    hid: 'nuxt-matomo-js',
    innerHTML: configJs,
    type: 'text/javascript'
  })
  this.options.head.script.push({
    src: options.scriptUrl || options.matomoUrl + 'piwik.js',
    async: true,
    defer: true
  })

  // Register plugin
  this.addPlugin({ src: path.resolve(__dirname, 'plugin.js'), ssr: false, options })
}

module.exports.meta = require('./package.json')
