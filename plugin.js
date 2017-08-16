// Setup piwik
window['_paq'] = window['_paq'] || []

export default ({ app: { router, store } }) => {
  let loc = window.location
  // Every time the route changes (fired on initialization too)
  router.afterEach((to, from) => {
    // Set page settings
    const settings = Object.assign({}, routeOption('piwik', from, to, store), to.meta && to.meta.piwik)
    Object.keys(settings).forEach(key => {
      window['_paq'].push(settings[key])
    })

    // We tell Piwik to add a page view
    window['_paq'].push(['trackLink', loc.protocol + '//' + loc.hostname + to.fullPath, 'link'])
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
