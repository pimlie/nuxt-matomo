<template>
  <div>
    <h1>manually tracked</h1>
    <nuxt-link :to="'/'">home</nuxt-link>
  </div>
</template>

<script>
export default {
  name: 'ManuallyTrackedPage',
  matomo: false,
  beforeRouteEnter (to, from, next) {
    next((vm) => {
      vm.$matomo.setDocumentTitle(vm.title)
      vm.$matomo.trackPageView()
    })
  },
  data () {
    return {
      title: 'manually tracked'
    }
  },
  head () {
    return {
      title: this.title
    }
  }
}
</script>
