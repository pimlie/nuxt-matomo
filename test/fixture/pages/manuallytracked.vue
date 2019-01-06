<template>
  <div>
    <h1>manually tracked</h1>
  </div>
</template>

<script>
export default {
  matomo: false,
  head: {
    title: 'manually tracked'
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      /**
       * No need to call setDocumentTitle here if matomo: false has been set
       * above. This callback is called after the DOM update and matomo already
       * uses document.title by default. If matomo: false has not been set, you
       * have to call setDocumentTitle here to override the
       * setDocumentTitle call in the plugin
       */
      vm.$matomo.trackPageView()
    })
  }
}
</script>
