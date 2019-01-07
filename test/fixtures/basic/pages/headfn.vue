<template>
  <div>
    <h1>headfn</h1>
    <router-link :to="'/'">home</router-link>
  </div>
</template>

<script>
export default {
  head() {
    // this wont work, this is unavaible when called from afterEach guard
    return {
      title: this.title
    }
  },
  data() {
    return {
      title: 'headfn'
    }
  }
}
</script>
