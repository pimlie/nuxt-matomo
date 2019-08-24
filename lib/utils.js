
export function debug (msg) {
  console.debug(`[nuxt-matomo] ${msg}`)
}

export function warn (msg) {
  console.warn(`[nuxt-matomo] ${msg}`)
}

export function isFn (fn) {
  return typeof fn === 'function'
}

export function waitFor (time) {
  return new Promise(resolve => setTimeout(resolve, time || 0))
}

export async function waitUntil (condition, timeout = 10000, interval = 10) {
  let duration = 0
  while (!(isFn(condition) ? condition() : condition)) {
    await waitFor(interval)
    duration += interval

    if (duration >= timeout) {
      break
    }
  }
}

export function routeOption (key, thisArg, from, to, ...args) {
  const matched = to.matched[0]
  const matchedComponent = matched.components.default
  return componentOption(matchedComponent, key, thisArg, from, to, ...args)
}

export function componentOption (component, key, thisArg, ...args) {
  if (!component || !component.options || component.options[key] === undefined) {
    return null
  }

  const option = component.options[key]
  return isFn(option) ? option.call(thisArg, ...args) : option
}
