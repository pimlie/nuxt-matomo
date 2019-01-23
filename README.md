# Matomo analytics for Nuxt.js
<a href="https://travis-ci.org/pimlie/nuxt-matomo"><img src="https://api.travis-ci.org/pimlie/nuxt-matomo.svg" alt="Build Status"></a>
[![npm](https://img.shields.io/npm/dt/nuxt-matomo.svg?style=flat-square)](https://www.npmjs.com/package/nuxt-matomo)
[![npm (scoped with tag)](https://img.shields.io/npm/v/nuxt-matomo/latest.svg?style=flat-square)](https://www.npmjs.com/package/nuxt-matomo)

Add Matomo analytics to your nuxt.js application. This plugin automatically sends first page and route change events to matomo

## Setup
> nuxt-matomo is not enabled in `dev` mode unless you set the debug option

- Install with 
```
npm install --save nuxt-matomo
// or
yarn add nuxt-matomo
```
- Add `nuxt-matomo` to `modules` section of `nuxt.config.js`
```js
  modules: [
    ['nuxt-matomo', { matomoUrl: '//matomo.example.com/', siteId: 1 }],
  ]
````

## Usage

By default `route.fullPath` and the [document title](#documenttitle) are tracked. You can add additional tracking info by adding a `route.meta.matomo` object in a middleware or by adding a matomo function or object to your page components.

The matomo javascript tracker is also injected as `$matomo` in the Nuxt.js context. Use this to e.g. manually track a page view. See the [injected](./test/fixtures/basic/pages/injected.vue) and [manually tracked](./test/fixtures/basic/pages/manuallytracked.vue) pages in the test fixture for an example

> :blue_book: See the official [Matomo JavaScript Tracking client docs](https://developer.matomo.org/api-reference/tracking-javascript) for a full overview of available methods

#### Middleware example
```js
export default function ({ route, store }) {
  route.meta.matomo = {
    documentTitle: ['setDocumentTitle', 'Some other title'],
    userId: ['setUserId', store.state.userId],
    someVar: ['setCustomVariable', 1, 'VisitorType', 'Member']
  }
}

```

#### Page component example
```js
<template>
  <div>
    <h1 v-if="expVarId === 1">New Content</h1>
    <h1 v-else>Original Content</h1>
  </div>
</template>

<script>
  export default {
    // the matomo function is bound to the Matomo tracker
    // (this function is called before the page component is initialized)
    matomo(from, to, store) {
      this.setCustomVariable(1, 'VisitorType', 'Special Member')
    },
    // return false if you want to manually track here
    matomo(from, to, store) {
      this.setDocumentTitle('my title')
      this.trackPageView()
      return false
    },
    // or let the function return an object
    matomo(from, to, store) {
      // this object is merged with the object returned by a global middleware,
      // use the object key to override properties from the middleware
      return {
        someVar: ['setCustomVariable', 1, 'VisitorType', 'Special Member']
      }
    },
    // or simply set an object
    matomo: {
      someVar: ['setCustomVariable', 1, 'VisitorType', 'Special Member']
    },
    [...]
  }
</script>
```

<details>
<summary><b style="font-size: .875em">Track manually with vue-router beforeRouterEnter guard</b></summary>

This is overly complicated, you probably shouldnt use this

```js
<template>
  <div>
    <h1>manually tracked</h1>
  </div>
</template>

<script>
export default {
  matomo: false,
  head() {
    return {
      title: this.title
    }
  },
  data() {
    return {
      title: 'manually tracked'
    }
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.$matomo.setDocumentTitle(vm.title)
      vm.$matomo.trackPageView()
    })
  }
}
</script>

```
</details>

## Consent

The plugin extends the matomo tracker with a `setConsent(<consentGiven>)` convenience method. 

When `setConsent()` is called, the plugin will automatically call rememberConsentGiven when the module option consentExpires has been set. To forget consent you can pass false to this method.

See the [basic fixture](./test/fixtures/basic) for an example how to use this method in combination with a Vuex store.

## Module Options

#### `siteId` (required)

The matomo siteId

#### `matomoUrl`

- Default: ` `
Url to matomo installation

#### `trackerUrl`

- Default: `matomoUrl + 'piwik.php'`
Url to piwik.php

#### `scriptUrl`

- Default: `matomoUrl + 'piwik.js'`
Url to piwik.js

#### `onMetaChange`

- Default: `false`
If true, page views will be tracked on the first vue-meta update after navigation occured. See caveats below for more information

#### `blockLoading`

- Default: `false`

If true, loading of the page is blocked until `window.Piwik` becomes available.
If false, a proxy implementation is used to delay tracker calls until Piwik is available.

#### `addNoProxyWorkaround`

- Default: `true`

When `blockLoading: false` we have to wait until `window.Piwik` becomes available, if a browser supports a [`Proxy`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy) then we use this. Older browsers like IE9/10 dont support this, for these browsers a manual list of api methods to proxy is added when `addNoProxyWorkaround: true`. See the list [here](./lib/api-methods-list.json)

> :warning: If you set this to `false` and still need to support IE9/10 you need to include a [ProxyPolyfill](https://github.com/GoogleChrome/proxy-polyfill) manually as [Babel](https://babeljs.io/docs/en/learn/#proxies) doesnt provide one

#### `cookies`

- Default: `true`
If false, Matomo will not create a tracking cookie

#### `consentRequired`

- Default: `false`
If true, Matomo will not start tracking until the user has given consent

#### `consentExpires`

- Default: `0`
If greater than 0 and when the `tracker.setConsent` method is called then we call `rememberConsentGiven(<consentExpires>)` instead of `setConsentGiven`. See above for more information

#### `doNotTrack`

- Default: `false`
If true, dont track users who have set Mozilla's (proposed) Do Not Track setting

#### `debug`

- Default: `false`
If true, the plugin will log debug information to the console. 

> The plugin also logs debug information when Nuxt's debug option is set

#### `verbose`

- Default: `false`
If true, the plugin will log every tracker function call to the console

## Caveats

### document.title

Nuxt.js uses vue-meta to asynchronously update the `document.title`, this means by default we dont know when the `document.title` is changed. Therefore the default behaviour for this plugin is to set the `route.path` as document title.

If you set the module option `onMetaChange: true`, then this plugin will track page views on the first time some meta data is updated by vue-meta (after navigation). This makes sure the `document.title` is available and updated, but if you have multiple pages without any meta data then those page views **could not be tracked**

> vue-meta's changed event is only triggered when any meta data changed, make sure all your routes have a [`head`](https://nuxtjs.org/api/pages-head) option.

When debug is true, this plugin will show warnings in the console when
- it detects pages without a title 
- when no vue-meta changed event is triggered within 500ms after navigation (tracking could still occur, the timeout only shows a warning)

You can also use a combination of manual tracking and a vuex store to keep track of the document.title
