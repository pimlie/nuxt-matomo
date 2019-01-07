import Vue from 'vue'
import { debug, warn, isFn, waitUntil, routeOption } from './utils'<% if(isTest) { %>// eslint-disable-line no-unused-vars<% } %>

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

  // inject tracker into app & context
  context.$matomo = tracker
  inject('matomo', tracker)

  // extend tracker
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
  // wrap all Piwik functions for verbose logging
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

  <% if(options.cookies === false) { %>
  tracker.disableCookies()
  <% } %>
  <% if(options.consentRequired !== false) { %>
  tracker.requireConsent()
  <% } %>
  <% if(options.doNotTrack !== false) { %>
  tracker.setDoNotTrack(true)
  <% } %>

  <% if(options.onMetaChange) { %>
  // onMetaChange setup
  let trackOnMetaChange
  <% if(debug || options.debug) { %>
  let metaChangeTimeout
  <% } %><% } %>

  // define hostname
  const host = window.location.protocol +
    (window.location.protocol.slice(-1) === ':' ? '' : ':') +
    '//' +
    window.location.host

  const trackRoute = ({ to, componentOption }) => {
    <% if(options.onMetaChange) { %>
    tracker.setDocumentTitle(document.title)
    <% } else { %>
    // we might not know the to's page title in vue-router.afterEach, DOM is updated _after_ afterEach
    tracker.setDocumentTitle(to.path)
    <% } %>
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
    debug(`Tell matomo to track pageview ${to.fullPath}`, document.title)

    <% } %>
    // tell Matomo to add a page view
    tracker.trackPageView()
  }

  <% if(options.onMetaChange) { %>
  // listen on vue-meta's changed event
  const changed = context.app.head.changed
  context.app.head.changed = (...args) => {
    <% if(debug || options.debug) { %>
    clearTimeout(metaChangeTimeout)

    if (!args[0].title) {
      warn(`title was updated but empty for ${trackOnMetaChange && trackOnMetaChange.to.fullPath || 'unknown route'}`)
    }
    <% } %>

    if (trackOnMetaChange) {
      trackRoute(trackOnMetaChange)
      trackOnMetaChange = null
    }

    if (changed && isFn(changed)) {
      changed.call(null, ...args)
    }
  }
  <% } %>

  // every time the route changes (fired on initialization too)
  router.afterEach(async (to, from) => {
    console.log(context)
    const componentOption = routeOption('matomo', tracker, from, to, store)
    if (componentOption === false) {
      <% if(debug || options.debug) { %>
      debug(`Component option returned false, wont (automatically) track pageview ${to.fullPath}`)
      <% } %>
      return
    }

    <% if(options.onMetaChange) { %>
    if (trackOnMetaChange === undefined) {
      // track on initialization
      trackRoute({ to, componentOption })
      trackOnMetaChange = null
    } else {
      trackOnMetaChange = { to, componentOption }

      <% if(debug || options.debug) { %>
      // set a timeout to track pages without a title/meta update
      metaChangeTimeout = setTimeout(() => {
        warn(`vue-meta's changed event was not triggered for ${to.fullPath}'`)
      }, 500)
      <% } %>
    }
    <% } else { %>
    await Vue.nextTick()
    trackRoute({ to, componentOption })
    <% } %>
  })
}
