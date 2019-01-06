<template>
  <div>
    <h1>injected</h1>
  </div>
</template>

<script>
export default {
  mounted() {
    this.$matomo.trackLink('file', 'download')
  }
}
</script>
