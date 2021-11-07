<template>
  <nuxt />
</template>

<script>
export default {
  name: 'DefaultLayout',
  computed: {
    consented () {
      return this.$store.state.matomo.consented
    }
  },
  watch: {
    consented (val) {
      this.$matomo.setConsent(val)
    }
  }
}
</script>
