export const state = () => ({
  cookies: true,
  consented: false
})

export const mutations = {
  cookies (state, noCookies) {
    state.cookies = !noCookies
  },
  consented (state, noConsent) {
    state.consented = !noConsent
  }
}
