<template>
  <div>
    <h1>headfn</h1>
    <router-link :to="'/'">home</router-link>
  </div>
</template>

<script>
export default {
  name: 'HeadFnPage',
  data () {
    return {
      title: 'headfn'
    }
  },
  head () {
    // this wont work, this is unavaible when called from afterEach guard
    return {
      title: this.title
    }
  }
}
</script>
