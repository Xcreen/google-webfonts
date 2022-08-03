<template>
  <div class="container">

    <div class="px-4 py-5 my-5">
      <h1 class="display-5 fw-bold text-center">Google Webfont Helper</h1>
      <div class="col-lg-6 mx-auto">
        <p class="lead mb-4 text-center">Easily integrate your favorite google webfonts locally into your website.</p>
        <div class="form-floating w-100 mb-4">
          <input type="text" class="form-control" id="search-font-input" placeholder="Search fonts..."
                 v-model="inputFontSearch" @keyup="filterFonts" autofocus>
          <label for="search-font-input">Search fonts...</label>
        </div>

        <span class="lead">Available fonts:</span>

        <ul class="list-group mt-2">
          <router-link :to="{ name: 'Font', params: { fontFamily: webfont.family.toLocaleLowerCase() }}"
                       v-for="webfont in displayWebFonts" class="list-group-item list-group-item-action">
            {{ webfont.family }} <small class="text-muted ms-2">{{ webfont.category }}</small>
          </router-link>
        </ul>

      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'home',
  data() {
    return {
      inputFontSearch: '',
      googleWebFonts: [],
      displayWebFonts: [],
      searchInterval: null
    }
  },
  methods: {
    filterFonts() {
      clearInterval(this.searchInterval)
      this.searchInterval = setInterval(() => {
        if(this.inputFontSearch.trim().length > 0) {
          let foundedFonts = []
          this.googleWebFonts.forEach(value => {
            if(value.family.toLowerCase().includes(this.inputFontSearch.trim().toLowerCase())) {
              foundedFonts.push(value)
            }
          })
          this.displayWebFonts = foundedFonts
        }
        else {
          this.displayWebFonts = this.googleWebFonts
        }
        clearInterval(this.searchInterval)
      }, 500)
    }
  },
  async mounted() {
    try {
      const googleWebFontResponse = await axios({
        method: 'get',
        url: this.$apiURL + 'google-webfont-api-data',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      this.googleWebFonts = googleWebFontResponse.data.items
      this.displayWebFonts = this.googleWebFonts
    }
    catch (requestException) {
      let extraText = requestException.code
      if (typeof requestException.response !== 'undefined' && typeof requestException.response.status !== 'undefined') {
        extraText = `(${requestException.code} ${requestException.response.status})`
      }
      console.log(`Failed to request ${this.$apiURL} ${extraText}`)
    }
  }
}
</script>

<style scoped>
</style>
