<template>
  <div>
    <h1>consent</h1>
  </div>
</template>

<script>
export default {
  name: 'RequireConsent',
  matomo () {
    this.requireConsent()
  },
  mounted () {
    /* setTimeout(() => {
      this.$store.commit('matomo/consented')
    }, 1000)/**/
  }
}
</script>
