import { Nuxt, Builder } from '../../utils'

describe('Build fixture', () => {
  let nuxt
  let builder
  let buildDone

  beforeAll(async () => {
    const config = require('./nuxt.config')
    nuxt = new Nuxt(config)

    buildDone = jest.fn()

    nuxt.hook('build:done', buildDone)
    builder = new Builder(nuxt)
    await builder.build()
  })

  test('correct build status', () => {
    expect(builder._buildStatus).toBe(2)
  })

  test('build:done hook called', () => {
    expect(buildDone).toHaveBeenCalledTimes(1)
  })
})
