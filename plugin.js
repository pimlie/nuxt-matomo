// Setup matomo
window['_paq'] = window['_paq'] || []

export default ({ app: { router, store } }) => {
  let loc = window.location
  // Every time the route changes (fired on initialization too)
  router.afterEach((to, from) => {
    // Set default page settings
    // We dont know the to's page title in vue-router.afterEach, DOM is updated _after_ afterEach
    // see: https://router.vuejs.org/en/advanced/navigation-guards.html
    // use path as default value
    window['_paq'].push(['setDocumentTitle', to.path])
    window['_paq'].push(['setCustomUrl', loc.protocol + '//' + loc.hostname + to.fullPath])

    // Allow override page settings
    const settings = Object.assign(
      {},
      routeOption('matomo', from, to, store),
      routeOption('piwik', from, to, store),
      to.meta && to.meta.matomo,
      to.meta && to.meta.piwik
    )
    Object.keys(settings).forEach(key => {
      window['_paq'].push(settings[key])
    })

    // We tell Matomo to add a page view
    window['_paq'].push(['trackPageView'])
  })
}

function routeOption (key, from, to, store) {
  let matched = to.matched[0]
  let matchedComponent = matched.components.default
  return componentOption(matchedComponent, key, from, to, store)
}

function componentOption (component, key, ...args) {
  if (!component || !component.options || !component.options[key]) {
    return {}
  }
  let option = component.options[key]
  if (typeof option === 'function') {
    option = option(...args)
  }
  return option
}
