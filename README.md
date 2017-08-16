# Piwik for NUXT
[![npm](https://img.shields.io/npm/dt/nuxt-piwik.svg?style=flat-square)](https://www.npmjs.com/package/nuxt-piwik)
[![npm (scoped with tag)](https://img.shields.io/npm/v/nuxt-piwik/latest.svg?style=flat-square)](https://www.npmjs.com/package/nuxt-piwik)

> Add Piwik to your nuxt.js application.
This plugins automatically sends first page and route change events to piwik

**Note:** piwik is not enabled in `dev` mode.
You can set environment variable `NODE_ENV` to `production` for testing in dev mode. 

## Setup
- Add `nuxt-piwik` dependency using yarn or npm to your project
- Add `nuxt-piwik` to `modules` section of `nuxt.config.js`
```js
  modules: [
    ['nuxt-piwik', { piwikUrl: '//piwik.example.com/', siteId: 1 }],
  ]
````

## Options

### `siteId`
- Required

### `piwikUrl`

Url to piwik installation

### `trackerUrl`

Url to piwik.php, default is `piwikUrl + 'piwik.php'`

### `scriptUrl`

Url to piwik.js, default is `piwikUrl + 'piwik.js'`

### Setting configuration at runtime
You can push any additional tracking info to `_paq` at runtime by adding a piwik 
object ```route.meta.piwik`` in the middleware or to the selected pages. An object
is used so we can override middleware variables for selected pages

Middleware example:
```javascript
export default function ({ route, store }) {
  route.meta.piwik = {
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

    piwik (from, to, store) {
      return {
        someVar: ['setCustomVariable', 1, 'VisitorType', 'Special Member']
      }
    },
    [...]
  }
</script>
``` 
