<template>
  <div>
    <h1>component fn</h1>
  </div>
</template>

<script>
export default {
  matomo(from, to, store) {
    return {
      someVar: ['setCustomVariable', 1, 'VisitorType', 'C', 'page']
    }
  }
}
</script>
