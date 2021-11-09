#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { JSDOM, ResourceLoader, VirtualConsole } = require('jsdom')

class MatomoResourceLoader extends ResourceLoader {
  fetch (url, options) {
    // Override the contents of this script to do something unusual.
    if (url.endsWith('piwik.js')) {
      return Promise.resolve(Buffer.from(fs.readFileSync(path.resolve(__dirname, '../test/utils/piwik.js'), 'utf8')))
    }

    return super.fetch(url, options)
  }
}

const { window } = new JSDOM('<!DOCTYPE html><html><head><script src="piwik.js"></script></head></html>', {
  url: 'https://example.org/',
  pretendToBeVisual: true,
  runScripts: 'dangerously',
  resources: new MatomoResourceLoader(),
  virtualConsole: new VirtualConsole().sendTo(console)
})

window.document.addEventListener('DOMContentLoaded', () => {
  const tracker = window.Piwik.getTracker('', 1)
  const fns = []
  Object.keys(tracker).forEach((fn) => {
    if (typeof tracker[fn] === 'function') {
      fns.push(fn)
    }
  })

  fs.writeFileSync(path.resolve(__dirname, '../lib/api-methods-list.json'), `${JSON.stringify(fns, null, 2)}\n`)
})
