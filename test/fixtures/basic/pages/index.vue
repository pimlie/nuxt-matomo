<template>
  <div>
    <h1>index</h1>

    <nuxt-link :to="'/middleware'">middleware</nuxt-link><br>
    <nuxt-link :to="'/headfn'">headfn</nuxt-link><br>
    <nuxt-link :to="'/manuallytracked'">manually tracked</nuxt-link><br>
    <nuxt-link :to="'/injected'">injected</nuxt-link><br>
  </div>
</template>
<script>
export default {
  name: 'IndexPage'
}
</script>
