<template>
  <router-link to="/">Go to Home</router-link>
  <router-link  to="/helloworld">Go to About</router-link>

  <router-view></router-view>
</template>

<script>
export default {
  name: 'App',
  components: {}
}
</script>

<style lang="scss">
@import "scss/app";
</style>