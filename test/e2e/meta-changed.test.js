import { URL } from 'url'
import { Nuxt, getPort, waitUntil, expectParams } from '../utils'
import Browser from '../utils/browser'

let port
const browser = new Browser()
const url = route => `http://localhost:${port}${route}`

describe('matomo analytics', () => {
  let nuxt
  let page
  let matomoUrl = []
  const createTrackerMsg = 'Created tracker for siteId 2 to ./piwik.php'

  beforeAll(async () => {
    const config = require('../fixtures/meta-changed/nuxt.config')
    nuxt = new Nuxt(config)

    port = await getPort()
    await nuxt.server.listen(port, 'localhost')
    await browser.start({})

    console.debug = jest.fn()
    console.warn = jest.fn()

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
    console.warn.mockClear()
  })

  test('matomo is triggered on page load', async () => {
    matomoUrl = []
    const pageUrl = '/page1'
    page = await browser.page(url(pageUrl))
    await waitUntil(() => matomoUrl.length >= 1)
    expect(matomoUrl.length).toBe(1)

    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching(createTrackerMsg))
    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching(`to track pageview ${pageUrl}`))

    expect(await page.$text('h1')).toBe('page1')

    expectParams(matomoUrl[0].searchParams, {
      idsite: '2',
      action_name: 'page1'
    })
  })

  test('matomo is triggered on navigation', async () => {
    matomoUrl = []
    const pageUrl = '/page2'
    await page.nuxt.navigate(pageUrl)
    await waitUntil(() => matomoUrl.length >= 1)
    expect(matomoUrl.length).toBe(1)

    expect(console.debug).not.toHaveBeenCalledWith(expect.stringMatching(createTrackerMsg))
    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching(`to track pageview ${pageUrl}`))

    expect(await page.$text('h1')).toBe('page2')

    expectParams(matomoUrl[0].searchParams, {
      idsite: '2',
      action_name: 'page2'
    })
  })

  test('warns on empty title', async () => {
    matomoUrl = []
    const pageUrl = '/notitle'
    await page.nuxt.navigate(pageUrl)
    await waitUntil(() => matomoUrl.length >= 1)
    expect(matomoUrl.length).toBe(1)

    expect(console.debug).not.toHaveBeenCalledWith(expect.stringMatching(createTrackerMsg))
    expect(console.debug).toHaveBeenCalledWith(expect.stringMatching(`to track pageview ${pageUrl}`))
    expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(`title was updated but empty for ${pageUrl}`))

    expect(await page.$text('h1')).toBe('notitle')

    expectParams(matomoUrl[0].searchParams, {
      idsite: '2',
      action_name: ''
    })
  })

  test('warns on meta changed timeout (in debug)', async () => {
    matomoUrl = []
    const pageUrl = '/noupdate'
    await page.nuxt.navigate(pageUrl)
    await waitUntil(() => matomoUrl.length >= 1, 2000)
    expect(matomoUrl.length).toBe(0)

    expect(console.debug).not.toHaveBeenCalledWith(expect.stringMatching(createTrackerMsg))
    expect(console.debug).not.toHaveBeenCalledWith(expect.stringMatching(`to track pageview ${pageUrl}`))
    expect(console.warn).toHaveBeenCalledWith(expect.stringMatching(`changed event was not triggered for ${pageUrl}`))

    expect(await page.$text('h1')).toBe('noupdate')
  })
})
