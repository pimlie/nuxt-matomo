import puppeteer from 'puppeteer'

export default class Browser {
  async start (options = {}) {
    // https://github.com/GoogleChrome/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions
    this.browser = await puppeteer.launch(
      Object.assign(
        {
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
          executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
        },
        options
      )
    )
  }

  async close () {
    if (!this.browser) { return }
    await this.browser.close()
  }

  async page (url, globalName = 'nuxt') {
    if (!this.browser) { throw new Error('Please call start() before page(url)') }
    const page = await this.browser.newPage()

    // pass on console messages
    const typeMap = {
      debug: 'debug',
      warning: 'warn'
    }
    page.on('console', (msg) => {
      if (typeMap[msg.type()]) {
        console[typeMap[msg.type()]](msg.text()) // eslint-disable-line no-console
      }
    })

    await page.goto(url)
    page.$nuxtGlobalHandle = `window.$${globalName}`
    await page.waitForFunction(`!!${page.$nuxtGlobalHandle}`)
    page.html = () =>
      page.evaluate(() => window.document.documentElement.outerHTML)
    page.$text = (selector, trim) => page.$eval(selector, (el, trim) => {
      return trim ? el.textContent.replace(/^\s+|\s+$/g, '') : el.textContent
    }, trim)
    page.$$text = (selector, trim) =>
      page.$$eval(selector, (els, trim) => els.map((el) => {
        return trim ? el.textContent.replace(/^\s+|\s+$/g, '') : el.textContent
      }), trim)
    page.$attr = (selector, attr) =>
      page.$eval(selector, (el, attr) => el.getAttribute(attr), attr)
    page.$$attr = (selector, attr) =>
      page.$$eval(
        selector,
        (els, attr) => els.map(el => el.getAttribute(attr)),
        attr
      )

    page.$nuxt = await page.evaluateHandle(page.$nuxtGlobalHandle)

    page.nuxt = {
      async navigate (path, waitEnd = true) {
        const hook = page.evaluate(`
          new Promise(resolve =>
            ${page.$nuxtGlobalHandle}.$once('routeChanged', resolve)
          ).then(() => new Promise(resolve => setTimeout(resolve, 50)))
        `)
        await page.evaluate(
          ($nuxt, path) => $nuxt.$router.push(path),
          page.$nuxt,
          path
        )
        if (waitEnd) {
          await hook
        }
        return { hook }
      },
      routeData () {
        return page.evaluate(($nuxt) => {
          return {
            path: $nuxt.$route.path,
            query: $nuxt.$route.query
          }
        }, page.$nuxt)
      },
      loadingData () {
        return page.evaluate($nuxt => $nuxt.$loading.$data, page.$nuxt)
      },
      errorData () {
        return page.evaluate($nuxt => $nuxt.nuxt.err, page.$nuxt)
      },
      storeState () {
        return page.evaluate($nuxt => $nuxt.$store.state, page.$nuxt)
      }
    }

    return page
  }
}
