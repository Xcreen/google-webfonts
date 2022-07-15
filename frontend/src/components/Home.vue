<template>
  <div class="container">

    <div class="px-4 py-5 my-5">
      <h1 class="display-5 fw-bold text-center">Google Webfont Helper</h1>
      <div class="col-lg-6 mx-auto">
        <p class="lead mb-4 text-center">Easily integrate your favorite google webfonts locally into your website.</p>
        <div class="form-floating w-100 mb-4">
          <input type="text" class="form-control" id="search-font-input" v-model="inputFontSearch" placeholder="Search fonts...">
          <label for="search-font-input">Search fonts...</label>
        </div>

        <span class="lead">Available fonts:</span>

        <ul class="list-group mt-2">
          <a href="#" class="list-group-item list-group-item-action">The current link item</a>
          <a href="#" class="list-group-item list-group-item-action">A second link item</a>
          <a href="#" class="list-group-item list-group-item-action">A third link item</a>
          <a href="#" class="list-group-item list-group-item-action">A fourth link item</a>
        </ul>

      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
export default {
  name: 'home',
  data() {
    return {
      inputFontSearch: ''
    }
  }
}
</script>

<style scoped>
</style>
