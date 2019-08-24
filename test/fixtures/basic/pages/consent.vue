<template>
  <div>
    <h1>consent</h1>
  </div>
</template>

<script>
export default {
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
