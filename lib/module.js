import { resolve } from 'path'

const defaults = {
  debug: false,
  verbose: false,
  siteId: null,
  matomoUrl: null,
  trackerUrl: null,
  scriptUrl: null,
  cookies: true,
  consentRequired: false,
  consentExpires: 0,
  doNotTrack: false
}

module.exports = function matomoModule(moduleOptions) {
  const options = Object.assign({}, defaults, moduleOptions)

  // do not enable in dev mode, unless debug is enabled or node-env is set to production
  if (this.options.dev && !options.debug && process.env.NODE_ENV !== 'production') {
    return
  }

  options.trackerUrl = options.trackerUrl || options.matomoUrl + 'piwik.php'
  options.scriptUrl = options.scriptUrl || options.matomoUrl + 'piwik.js'

  this.options.head.script.push({
    src: options.scriptUrl,
    body: true,
    defer: true,
    async: true
  })

  this.addTemplate({
    src: resolve(__dirname, 'utils.js'),
    fileName: 'matomo/utils.js',
    ssr: false
  })

  // register plugin
  this.addPlugin({
    src: resolve(__dirname, 'plugin.js'),
    fileName: 'matomo/plugin.js',
    ssr: false,
    options
  })
}
