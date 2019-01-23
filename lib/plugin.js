import { debug, warn, isFn, waitUntil, routeOption } from './utils'

<% if (!isDev && options.debug) consola.warn('nuxt-matomo debug is enabled') %>

export default <%= options.blockLoading ? 'async ' : ''%>(context, inject) => {
  const { app: { router, store } } = context

  <% if (options.blockLoading) { %>
  await waitUntil(() => window.Piwik)
  const tracker = createTracker()
  if (!tracker) return
  <% } else { %>
  let tracker
  if (window.Piwik) {
    tracker = createTracker()
  } else {
    // if window.Piwik is not (yet) available, add a Proxy which delays calls
    // to the tracker and execute them once the Piwik tracker becomes available
    let delayedCalls = []
    const delayTrackerCall = (fnName, ...args) => {
      <% if(debug || options.debug) { %>
      debug(`Delaying call to tracker: ${fnName}`)
      <% } %>
      delayedCalls.push([fnName, ...args])
    }

    let _tracker // this will be the real Piwik tracker
    tracker = new Proxy({}, { // This might not work on IE
      get(target, key) {
        if (_tracker) {
          return _tracker[key]
        }

        return (...args) => delayTrackerCall(key, ...args)
      }
    })

    <% if(debug || options.debug) { %>
    const hasPiwikCheck = setTimeout(() => {
      if (!window.Piwik) {
        debug(`window.Piwik was not set within timeout`)
      }
    }, 10000)
    <% } %>

    // Use a getter/setter to known when window.Piwik becomes available
    let _windowPiwik
    Object.defineProperty(window, 'Piwik', {
      configurable: true,
      enumerable: true,
      get() {
        return _windowPiwik
      },
      set(newVal) {
        <% if(debug || options.debug) { %>
        clearTimeout(hasPiwikCheck)
        if (_windowPiwik) {
          debug(`window.Piwik is already defined`)
        }
        <% } %>

        _windowPiwik = newVal
        _tracker = createTracker(delayedCalls)
      }
    })
  }
  <% } %>

  // inject tracker into app & context
  context.$matomo = tracker
  inject('matomo', tracker)

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
    // tell Matomo to add a page view (doesnt do anything if tracker is disabled)
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
  router.afterEach((to, from) => {
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
    trackRoute({ to, componentOption })
    <% } %>
  })
}

function createTracker(delayedCalls = []) {
  if (!window.Piwik) {
    <% if(debug || options.debug) { %>
    debug(`window.Piwik not initialized, unable to create a tracker`)
    <% } %>
    return
  }

  const tracker = window.Piwik.getTracker('<%= options.trackerUrl %>', '<%= options.siteId %>')

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

  while (delayedCalls.length) {
    const [fnName, ...args] = delayedCalls.shift()
    if (isFn(tracker[fnName])) {
      <% if(debug || options.debug) { %>
      debug(`Calling delayed ${fnName} on tracker`)
      <% } %>
      tracker[fnName](...args)
    }
  }

  delayedCalls = void 0
  return tracker
}
