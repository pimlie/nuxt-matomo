import { URL } from 'url'
import { Nuxt, getPort, waitFor, waitUntil } from '../utils'
import Browser from '../utils/browser'

let port
const browser = new Browser()
const url = route => `http://localhost:${port}${route}`

describe('Nuxt Matomo', () => {
  let nuxt
  let page
  let matomoUrl = []

  beforeAll(async () => {
    const config = require('../fixture/nuxt.config')
    nuxt = new Nuxt(config)

    port = await getPort()
    await nuxt.server.listen(port, 'localhost')
    await browser.start({})

    console.debug = jest.fn()

    nuxt.hook('render:route', (url, result, context) => {
      if (url.indexOf('piwik.php') > -1) {
        matomoUrl.push(new URL(url, `http://localhost:${port}`))
      }
    })
  })

  afterAll(async () => {
    await nuxt.close()
    await browser.close()
  })

  afterEach(() => {
    console.debug.mockClear()
  })

  test('matomo is triggered on page load', async () => {
    matomoUrl = []
    const pageUrl = url('/')
    page = await browser.page(pageUrl)
    await waitUntil(() => matomoUrl.length >= 1)

    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching('Created tracker for siteId 1 to ./piwik.php'))
    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching(`to track pageview ${pageUrl}`))

    expect(await page.$text('h1')).toBe('index')

    expect(matomoUrl[0].searchParams.get('idsite')).toBe('1')
    expect(matomoUrl[0].searchParams.get('action_name')).toBe('/')
  })

  test('cookies have been set', async () => {
    const cookies = await page.cookies()

    expect(cookies[0].name).toEqual(expect.stringMatching('_pk_ses.1.'))
    expect(cookies[1].name).toEqual(expect.stringMatching('_pk_id.1.'))
  })

  test('matomo is triggered on navigation', async () => {
    matomoUrl = []
    const pageUrl = url('/middleware')
    await page.nuxt.navigate('/middleware')
    await waitUntil(() => matomoUrl.length >= 1)

    expect(console.debug).not.toHaveBeenCalledWith(expect.stringMatching('Created tracker for siteId 1 to ./piwik.php'))
    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching(`to track pageview ${pageUrl}`))

    expect(await page.$text('h1')).toBe('middleware')

    expect(matomoUrl[0].searchParams.get('idsite')).toBe('1')
    expect(matomoUrl[0].searchParams.get('action_name')).toBe('/middleware')
  })

  test('route.meta from global middleware is used', () => {
    expect(matomoUrl[0].searchParams.get('cvar')).toBeTruthy()
    const cvar = JSON.parse(matomoUrl[0].searchParams.get('cvar'))
    expect(cvar['1']).toBeTruthy()
    expect(cvar['1'][0]).toBe('VisitorType')
    expect(cvar['1'][1]).toBe('A')
    expect(cvar['2']).toBeTruthy()
    expect(cvar['2'][0]).toBe('OtherType')
    expect(cvar['2'][1]).toBe('true')
  })

  test('matomo prop defined in page component is used', async () => {
    matomoUrl = []
    await page.nuxt.navigate('/component-prop')
    await waitUntil(() => matomoUrl.length >= 1)

    expect(await page.$text('h1')).toBe('component prop')

    expect(matomoUrl[0].searchParams.get('idsite')).toBe('1')
    expect(matomoUrl[0].searchParams.get('action_name')).toBe('/component-prop')

    expect(matomoUrl[0].searchParams.get('cvar')).toBeTruthy()
    const cvar = JSON.parse(matomoUrl[0].searchParams.get('cvar'))
    expect(cvar['1']).toBeTruthy()
    expect(cvar['1'][0]).toBe('VisitorType')
    expect(cvar['1'][1]).toBe('B')
    expect(cvar['2']).toBeTruthy()
    expect(cvar['2'][0]).toBe('OtherType')
    expect(cvar['2'][1]).toBe('true')
  })

  test('matomo function defined in page component is used', async () => {
    matomoUrl = []
    await page.nuxt.navigate('/component-fn')
    await waitUntil(() => matomoUrl.length >= 1)

    expect(await page.$text('h1')).toBe('component fn')

    expect(matomoUrl[0].searchParams.get('idsite')).toBe('1')
    expect(matomoUrl[0].searchParams.get('action_name')).toBe('/component-fn')

    expect(matomoUrl[0].searchParams.get('cvar')).toBeTruthy()
    const cvar = JSON.parse(matomoUrl[0].searchParams.get('cvar'))
    expect(cvar['1']).toBeTruthy()
    expect(cvar['1'][0]).toBe('VisitorType')
    expect(cvar['1'][1]).toBe('C')
    expect(cvar['2']).toBeTruthy()
    expect(cvar['2'][0]).toBe('OtherType')
    expect(cvar['2'][1]).toBe('true')
  })

  test('tracker is injected and can be used', async () => {
    matomoUrl = []
    const pageUrl = url('/injected')
    page = await browser.page(pageUrl)
    await waitUntil(() => matomoUrl.length >= 2)

    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching('Created tracker for siteId 1 to ./piwik.php'))
    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching(`to track pageview ${pageUrl}`))

    expect(await page.$text('h1')).toBe('injected')

    expect(matomoUrl[0].searchParams.get('idsite')).toBe('1')
    expect(matomoUrl[0].searchParams.get('action_name')).toBe('/injected')

    expect(matomoUrl[0].searchParams.get('cvar')).toBeFalsy()
    expect(matomoUrl[1].searchParams.get('idsite')).toBe('1')
    expect(matomoUrl[1].searchParams.get('download')).toBe('file')
  })

  test('can disable automatic tracking to track manually', async () => {
    matomoUrl = []
    const pageUrl = url('/manuallytracked')
    page = await browser.page(pageUrl)
    await waitUntil(() => matomoUrl.length >= 1)
    await waitFor(100) // wait a bit more

    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching('Created tracker for siteId 1 to ./piwik.php'))
    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching(`wont track pageview ${pageUrl}`))

    expect(await page.$text('h1')).toBe('manually tracked')

    expect(matomoUrl.length).toBe(1)
    expect(matomoUrl[0].searchParams.get('idsite')).toBe('1')
    expect(matomoUrl[0].searchParams.get('action_name')).toBe('manually tracked')
    expect(matomoUrl[0].searchParams.get('cvar')).toBeFalsy()
  })

  test('does not track when consent is required', async () => {
    matomoUrl = []
    const pageUrl = url('/consent')
    page = await browser.page(pageUrl)
    await waitFor(250) // wait a bit

    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching('Created tracker for siteId 1 to ./piwik.php'))
    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching(`to track pageview ${pageUrl}`))

    expect(await page.$text('h1')).toBe('consent')
    expect(matomoUrl.length).toBe(0)
  })

  test('still does not track when consent is required', async () => {
    matomoUrl = []
    const pageUrl = url('/')
    await page.nuxt.navigate('/')
    await waitFor(250) // wait a bit

    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching(`to track pageview ${pageUrl}`))

    expect(await page.$text('h1')).toBe('index')
    expect(matomoUrl.length).toBe(0)
  })

  test('tracking is triggered once consent is given', async () => {
    matomoUrl = []

    await page.evaluate($nuxt => $nuxt.$store.commit('matomo/consented'), page.$nuxt)
    const store = await page.nuxt.storeState()
    expect(store.matomo.consented).toBe(true)

    await waitUntil(() => matomoUrl.length >= 1)

    expect(console.debug).not.toHaveBeenCalled()

    expect(matomoUrl[0].searchParams.get('idsite')).toBe('1')
    expect(matomoUrl[0].searchParams.get('action_name')).toBe('/')
    expect(matomoUrl[0].searchParams.get('cvar')).toBeFalsy()
  })
})
