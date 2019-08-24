import { URL } from 'url'
import { Nuxt, getPort, waitFor, waitUntil, expectParams } from '../utils'
import Browser from '../utils/browser'

let port
const browser = new Browser()
const url = route => `http://localhost:${port}${route}`

describe('matomo analytics', () => {
  let nuxt
  let page
  let matomoUrl = []
  const createTrackerMsg = 'Created tracker for siteId 1 to ./piwik.php'

  beforeAll(async () => {
    const config = require('../fixtures/basic/nuxt.config')
    nuxt = new Nuxt(config)

    port = await getPort()
    await nuxt.server.listen(port, 'localhost')
    await browser.start({})

    console.debug = jest.fn()
    console.warn = jest.fn()

    nuxt.hook('render:route', (url, result, context) => {
      if (url.includes('piwik.php')) {
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
    console.warn.mockClear()
  })

  test('matomo is triggered on page load', async () => {
    matomoUrl = []
    const pageUrl = '/'
    page = await browser.page(url(pageUrl))
    await waitUntil(() => matomoUrl.length >= 1)

    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching(createTrackerMsg))
    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching(`to track pageview ${pageUrl}`))

    expect(await page.$text('h1')).toBe('index')

    expectParams(matomoUrl[0].searchParams, {
      idsite: '1',
      action_name: pageUrl
    })
  })

  test('cookies have been set', async () => {
    const cookies = await page.cookies()

    expect(cookies[0].name).toEqual(expect.stringMatching('_pk_ses.1.'))
    expect(cookies[1].name).toEqual(expect.stringMatching('_pk_id.1.'))
  })

  test('matomo is triggered on navigation', async () => {
    matomoUrl = []
    const pageUrl = '/middleware'
    await page.nuxt.navigate(pageUrl)
    await waitUntil(() => matomoUrl.length >= 1)

    expect(console.debug).not.toHaveBeenCalledWith(expect.stringMatching(createTrackerMsg))
    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching(`to track pageview ${pageUrl}`))

    expect(await page.$text('h1')).toBe('middleware')

    expectParams(matomoUrl[0].searchParams, {
      idsite: '1',
      action_name: pageUrl
    })
  })

  test('route.meta from global middleware is used', () => {
    expectParams(matomoUrl[0].searchParams, {
      cvar: [
        ['VisitorType', 'A'],
        ['OtherType', 'true']
      ]
    })
  })

  test('matomo prop defined in page component is used', async () => {
    matomoUrl = []
    const pageUrl = '/component-prop'
    await page.nuxt.navigate(pageUrl)
    await waitUntil(() => matomoUrl.length >= 1)

    expect(await page.$text('h1')).toBe('component prop')

    expectParams(matomoUrl[0].searchParams, {
      idsite: '1',
      action_name: pageUrl,
      cvar: [
        ['VisitorType', 'B'],
        ['OtherType', 'true']
      ]
    })
  })

  test('matomo function defined in page component is used', async () => {
    matomoUrl = []
    const pageUrl = '/component-fn'
    await page.nuxt.navigate(pageUrl)
    await waitUntil(() => matomoUrl.length >= 1)

    expect(await page.$text('h1')).toBe('component fn')

    expectParams(matomoUrl[0].searchParams, {
      idsite: '1',
      action_name: pageUrl,
      cvar: [
        ['VisitorType', 'C'],
        ['OtherType', 'true']
      ]
    })
  })

  test('tracker is injected and can be used', async () => {
    matomoUrl = []
    const pageUrl = '/injected'
    await page.nuxt.navigate(pageUrl)
    await waitUntil(() => matomoUrl.length >= 2)

    expect(console.debug).not.toHaveBeenCalledWith(expect.stringMatching(createTrackerMsg))
    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching(`to track pageview ${pageUrl}`))

    expect(await page.$text('h1')).toBe('injected')

    expectParams(matomoUrl[0].searchParams, {
      idsite: '1',
      action_name: pageUrl,
      cvar: [
        ['VisitorType', 'C'],
        ['OtherType', 'true']
      ]
    })

    expectParams(matomoUrl[1].searchParams, {
      idsite: '1',
      download: 'file'
    })
  })

  test('can disable automatic tracking to track manually', async () => {
    matomoUrl = []
    const pageUrl = '/manuallytracked'
    await page.nuxt.navigate(pageUrl)
    await waitUntil(() => matomoUrl.length >= 1)
    await waitFor(100) // wait a bit more

    expect(console.debug).not.toHaveBeenCalledWith(expect.stringMatching(createTrackerMsg))
    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching(`wont \\(automatically\\) track pageview ${pageUrl}`))

    expect(await page.$text('h1')).toBe('manually tracked')

    expect(matomoUrl.length).toBe(1)
    expectParams(matomoUrl[0].searchParams, {
      idsite: '1',
      action_name: 'manually tracked',
      cvar: [
        ['VisitorType', 'C'],
        ['OtherType', 'true']
      ]
    })
  })

  test('does not track when consent is required', async () => {
    matomoUrl = []
    const pageUrl = '/consent'
    await page.nuxt.navigate(pageUrl)
    await waitFor(250) // wait a bit

    expect(console.debug).not.toHaveBeenCalledWith(expect.stringMatching(createTrackerMsg))
    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching(`to track pageview ${pageUrl}`))

    expect(await page.$text('h1')).toBe('consent')
    expect(matomoUrl.length).toBe(0)
  })

  test('still does not track when consent is required', async () => {
    matomoUrl = []
    const pageUrl = '/'
    await page.nuxt.navigate(pageUrl)
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

    expectParams(matomoUrl[0].searchParams, {
      idsite: '1',
      action_name: '/',
      cvar: [
        ['VisitorType', 'A'],
        ['OtherType', 'true']
      ]
    })
  })
})
