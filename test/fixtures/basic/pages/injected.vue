<template>
  <div>
    <h1>injected</h1>
    <nuxt-link :to="'/'">home</nuxt-link>
  </div>
</template>

<script>
export default {
  name: 'InjectedPage',
  mounted () {
    this.$matomo.trackLink('file', 'download')
  }
}
</script>
