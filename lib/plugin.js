import { debug, isFn, waitUntil, routeOption } from './utils'

<% if (!isDev && options.debug) consola.warn('nuxt-matomo debug is enabled') %>

export default async (context, inject) => {
  const { app: { router, store } } = context
  await waitUntil(() => window.Piwik)

  if (!window.Piwik) {
    <% if(debug || options.debug) { %>
    debug(`window.Piwik not initialized, unable to create a tracker`)
    <% } %>
    return
  }

  const tracker = window.Piwik.getTracker('<%= options.trackerUrl %>', '<%= options.siteId %>')
  tracker.setConsent = (val) => {
    if (val || val === undefined) {
      <% if(options.consentExpires > 0) { %>
      tracker.rememberConsentGiven(<%= options.consentExpires %>)
      <% } else { %>
      tracker.setConsentGiven()
      <% } %>
    } else {
      tracker.forgetConsentGiven()
    }
  }

  <% if(debug || options.debug) { %>
  debug(`Created tracker for siteId <%= options.siteId %> to <%= options.trackerUrl %>`)
  <% if(options.verbose) { %>
  Object.keys(tracker).forEach((key) => {
    const fn = tracker[key]
    if (isFn(fn)) {
      tracker[key] = (...args) => {
        debug(`Calling tracker.${key} with args ${JSON.stringify(args)}`)
        return fn.call(tracker, ...args)
      }
    }
  })
  <% } %><% } %>

  context.$matomo = tracker
  inject('matomo', tracker)

  <% if(options.cookies === false) { %>
  tracker.disableCookies()
  <% } %>
  <% if(options.consentRequired !== false) { %>
  tracker.requireConsent()
  <% } %>
  <% if(options.doNotTrack !== false) { %>
  tracker.setDoNotTrack(true)
  <% } %>

  const host = window.location.protocol +
    (window.location.protocol.slice(-1) === ':' ? '' : ':') +
    '//' +
    window.location.host

  // every time the route changes (fired on initialization too)
  router.afterEach((to, from) => {
    const componentOption = routeOption('matomo', tracker, from, to, store)
    if (componentOption === false) {
      <% if(debug || options.debug) { %>
      debug(`Component option returned false, wont track pageview ${host}${to.fullPath}`)
      <% } %>
      return
    }
    // we dont know the to's page title in vue-router.afterEach, DOM is updated _after_ afterEach
    // see: https://router.vuejs.org/en/advanced/navigation-guards.html
    // use path as default value
    tracker.setDocumentTitle(to.path)
    tracker.setCustomUrl(host + to.fullPath)

    // allow override page settings
    const settings = Object.assign(
      {},
      context.route.meta && context.route.meta.matomo,
      componentOption
    )
    
    for (const key in settings) {
      const setting = settings[key]
      const fn = setting.shift()
      if (isFn(tracker[fn])) {
        <% if(debug || options.debug) { %>
        debug(`Calling matomo.${fn} with args ${JSON.stringify(setting)}`)
        <% } %>
        tracker[fn].call(null, ...setting)
      <% if(debug || options.debug) { %>
      } else {
        debug(`Unknown matomo function ${fn} with args ${JSON.stringify(setting)}`)
      <% } %>
      }
    }

    <% if(debug || options.debug) { %>
    debug(`Tell matomo to track pageview ${host}${to.fullPath}`)
    <% } %>
    // tell Matomo to add a page view
    tracker.trackPageView()
  })
}
