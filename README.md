# Matomo for NUXT
[![npm](https://img.shields.io/npm/dt/nuxt-matomo.svg?style=flat-square)](https://www.npmjs.com/package/nuxt-matomo)
[![npm (scoped with tag)](https://img.shields.io/npm/v/nuxt-matomo/latest.svg?style=flat-square)](https://www.npmjs.com/package/nuxt-matomo)

> Add Matomo to your nuxt.js application.
This plugins automatically sends first page and route change events to matomo

**Note:** matomo is not enabled in `dev` mode.
You can set environment variable `NODE_ENV` to `production` for testing in dev mode. 

## Setup
- Install with npm `npm install --save nuxt-matomo` or use yarn
- Add `nuxt-matomo` to `modules` section of `nuxt.config.js`
```js
  modules: [
    ['nuxt-matomo', { matomoUrl: '//matomo.example.com/', siteId: 1 }],
  ]
````

## Options

### `siteId`
- Required

### `matomoUrl`

Url to matomo installation

### `trackerUrl`

Url to matomo.php, default is `matomoUrl + 'matomo.php'`

### `scriptUrl`

Url to matomo.js, default is `matomoUrl + 'matomo.js'`

### Setting configuration at runtime
You can push any additional tracking info to `_paq` at runtime by adding a matomo 
object ```route.meta.matomo`` in the middleware or to the selected pages. An object
is used so we can override middleware variables for selected pages

Middleware example:
```javascript
export default function ({ route, store }) {
  route.meta.matomo = {
    documentTitle: ['setDocumentTitle', 'Some other title'],
    userId: ['setUserId', store.state.userId],
    someVar: ['setCustomVariable', 1, 'VisitorType', 'Member']
  }
}

```

### Setting configuration at runtime for selected pages
```
<template>
  <div>
    <h1 v-if="expVarId === 1">New Content</h1>
    <h1 v-else>Original Content</h1>
  </div>
</template>
<script>
  export default {

    matomo (from, to, store) {
      return {
        someVar: ['setCustomVariable', 1, 'VisitorType', 'Special Member']
      }
    },
    [...]
  }
</script>
``` 
