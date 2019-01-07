<template>
  <div>
    <h1>injected</h1>
    <router-link :to="'/'">home</router-link>
  </div>
</template>

<script>
export default {
  mounted() {
    this.$matomo.trackLink('file', 'download')
  }
}
</script>
