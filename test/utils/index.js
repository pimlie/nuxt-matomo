export { isFn, waitFor, waitUntil } from '../../lib/utils'

export function expectParams (received, expectedParams) {
  if (!expectedParams) {
    expect(received).toBeFalsy()
  } else {
    expect(received).toBeTruthy()

    for (const key in expectedParams) { // eslint-disable-line no-unused-vars
      if (key === 'cvar') {
        expectCvars(received.get(key), expectedParams[key])
      } else {
        expect(received.get(key)).toBe(expectedParams[key])
      }
    }
  }
}

export function expectCvars (received, expectedCvars) {
  if (!expectedCvars) {
    expect(received).toBeFalsy()
  } else {
    expect(received).toBeTruthy()

    const cvars = JSON.parse(received)

    for (const key in expectedCvars) { // eslint-disable-line no-unused-vars
      const expectedCvar = expectedCvars[key]
      const cvar = cvars[`${parseInt(key) + 1}`]

      expect(cvar).toBeTruthy()
      expect(cvar[0]).toBe(expectedCvar[0])
      expect(cvar[1]).toBe(expectedCvar[1])
    }
  }
}
