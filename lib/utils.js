
export function debug(msg) {
  console.debug(`[nuxt-matomo] ${msg}`)
}

export function isFn(fn) {
  return typeof fn === 'function'
}

export function waitFor(time) {
  return new Promise(resolve => setTimeout(resolve, time || 0))
}

export async function waitUntil(condition, timeout = 10000, interval = 10) {
  let duration = 0
  while (!(isFn(condition) ? condition() : condition)) {
    await waitFor(interval)
    duration += interval

    if (duration >= timeout) {
      break
    }
  }
}

export function routeOption(key, tracker, from, to, store) {
  const matched = to.matched[0]
  const matchedComponent = matched.components.default
  return componentOption(matchedComponent, key, tracker, from, to, store)
}

export function componentOption(component, key, tracker, ...args) {
  if (!component || !component.options || component.options[key] === undefined) {
    return {}
  }

  const option = component.options[key]
  return isFn(option) ? option.call(tracker, ...args) : option
}
