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

### Setting configuration at runtime

You can add additional tracking info by adding a `route.meta.matomo` object in a middleware and by adding a matomo object or function to your page component.

> The VueRouter afterEach guard which this plugin uses is called before your page component is created

The matomo javascript tracker is also injected as `$matomo` in your Nuxt instance to e.g. manually track a page view. See the [injected](./test/fixture/pages/injected.vue) and [manually tracked](./test/fixture/pages/manuallytracked.vue) pages in the test fixture for an example

##### Middleware example
```js
export default function ({ route, store }) {
  route.meta.matomo = {
    documentTitle: ['setDocumentTitle', 'Some other title'],
    userId: ['setUserId', store.state.userId],
    someVar: ['setCustomVariable', 1, 'VisitorType', 'Member']
  }
}

```

##### Page component example
```js
<template>
  <div>
    <h1 v-if="expVarId === 1">New Content</h1>
    <h1 v-else>Original Content</h1>
  </div>
</template>

<script>
  export default {
    // the matomo function is binded to the tracker
    matomo (from, to, store) {
      this.setCustomVariable(1, 'VisitorType', 'Special Member')
    },
    // or let the function return an object
    matomo (from, to, store) {
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

##### Track manually (with document.title)
```js
<template>
  <div>
    <h1>manually tracked</h1>
  </div>
</template>

<script>
export default {
  matomo: false,
  head: {
    title: 'manually tracked'
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      /**
       * No need to call setDocumentTitle here if matomo: false has been set
       * above. This callback is called after the DOM update and matomo already
       * uses document.title by default. If matomo: false has not been set, you
       * have to call setDocumentTitle here to override the
       * setDocumentTitle call in the plugin
       */
      vm.$matomo.trackPageView()
    })
  }
}
</script>
```

## Consent

The plugin extends the matomo tracker with a `setConsent(<consentGiven>)` convenience method. 

When `setConsent()` is called, the plugin will automatically call rememberConsentGiven when the module option consentExpires has been set. To forget consent you can pass false to this method.

See the [default layout](./test/fixture/layouts/default.vue) in the test fixture for how to use this method in combination with a Vuex store.

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

## Known issues

This plugin uses a VueRouter afterEach guard to track navigation. Because the DOM is only updated after all afterEach guard's have been called (see the [VueRouter docs](https://router.vuejs.org/en/advanced/navigation-guards.html)), we dont know the document.title for the new page. This plugin fallsback to setting the route.path as document title.

If you really wish to track the document title, you can add a `beforeRouteEnter()` guard in your page components and pass a callback to the next method. See above or the [manually tracked](./test/fixture/pages/manuallytracked.vue) page for an example.
