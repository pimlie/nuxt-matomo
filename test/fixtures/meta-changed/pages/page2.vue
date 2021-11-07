<template>
  <div>
    <h1>page2</h1>
    <nuxt-link to="/page1">to page1</nuxt-link>
  </div>
</template>

<script>
export default {
  name: 'PageTwo',
  head () {
    return {
      title: 'page2'
    }
  }
}
</script>
