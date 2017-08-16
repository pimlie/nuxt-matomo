const path = require('path')

module.exports = function nuxtPiwik (options) {
  // Don't include on dev mode
  if (this.options.dev && process.env.NODE_ENV !== 'production') {
    return
  }

  // Add piwik script to head
  let config_js = "window['_paq'] = [];";
  condig_js += "window['_paq'].push(['setTrackerUrl', '" + (options.trackerUrl || options.piwikUrl+'piwik.php') + "']);"
  config_js += "window['_paq'].push(['setSiteId', '" + options.siteId + "']);"

  this.options.head.__dangerouslyDisableSanitizers = ['script']
  this.options.head.script.push({ 
    innerHTML: config_js, type: 'text/javascript'
  })
  this.options.head.script.push({
    src: options.scriptUrl || options.piwikUrl+'piwik.js',
    async: true,
    defer: true
  })

  // Register plugin
  this.addPlugin({src: path.resolve(__dirname, 'plugin.js'), ssr: false, options})
}

module.exports.meta = require('./package.json')
