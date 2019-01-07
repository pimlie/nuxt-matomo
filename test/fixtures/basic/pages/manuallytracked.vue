<template>
  <div>
    <h1>manually tracked</h1>
    <router-link :to="'/'">home</router-link>
  </div>
</template>

<script>
export default {
  matomo: false,
  head() {
    return {
      title: this.title
    }
  },
  data() {
    return {
      title: 'manually tracked'
    }
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      vm.$matomo.setDocumentTitle(vm.title)
      vm.$matomo.trackPageView()
    })
  }
}
</script>
