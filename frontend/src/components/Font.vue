<template>
  <div class="container">

    <div class="px-4 py-5 my-5">
      <h1 class="display-5 fw-bold text-center">
        <router-link to="/" class="float-start btn btn-primary">
          <i class="fa-solid fa-angle-left"></i>
          Back to fonts
        </router-link>
        Google Webfont Helper
      </h1>


      <h2 class="display-6 text-center">{{ googleWebFont.family }} <small><i>{{ googleWebFont.category }}</i></small></h2>

      <div class="row">
        <div class="col-sm-4">
          <h4>Select Styles</h4>
          <div v-for="fontVariant in googleWebFont.variants" class="mb-1 form-check">
            <input type="checkbox" class="form-check-input"
                   :id="'font-variant-checkbox-' + fontVariant" :value="fontVariant"
                   v-model="selectedVariants" @change="selectVariant">
            <label class="form-check-label" :for="'font-variant-checkbox-' + fontVariant">{{ fontVariant }}</label>
          </div>
          <h4>Other</h4>
          <div class="mb-3 form-check">
            <input type="checkbox" class="form-check-input" id="load-local-font-checkbox"
                   v-model="loadLocalFont" @change="selectVariant">
            <label class="form-check-label" for="load-local-font-checkbox">Load font from system, if it´s available</label>
          </div>
          <div class="mb-1">
              <label for="exampleInputEmail1" class="form-label">Custom folder</label>
              <input type="text" class="form-control" id="exampleInputEmail1" v-model="folderPrefix">
          </div>
        </div>
        <div class="col-sm-8">
          <h4>Copy Font-CSS</h4>

          <div v-for="fontVariant in selectedVariants" class="css-code">
            <pre>
<code>
  /* {{ googleWebFont.family }} regular - latin */
  @font-face {
    font-family: '{{ googleWebFont.family }}';
    font-style: normal;
    font-weight: 400;
    src: {{ getLocalFontCSS(googleWebFont.family) }}url('{{ folderPrefix }}/abeezee-v22-latin-regular.woff2') format('woff2'),
         url('{{ folderPrefix }}/abeezee-v22-latin-regular.woff') format('woff');
  }
</code>
            </pre>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'Font',
  data() {
    return {
      googleWebFont: {},
      selectedVariants: [],
      loadLocalFont: true,
      folderPrefix: '../fonts'
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
      googleWebFontResponse.data.items.forEach(value => {
        if(value.family.toLowerCase() === this.$route.params.fontFamily.trim().toLowerCase()) {
          this.googleWebFont = value
          this.selectedVariants.push('regular')

          console.log(value)
        }
      })
    }
    catch (requestException) {
      let extraText = requestException.code
      if (typeof requestException.response !== 'undefined' && typeof requestException.response.status !== 'undefined') {
        extraText = `(${requestException.code} ${requestException.response.status})`
      }
      console.log(`Failed to request ${this.$apiURL} ${extraText}`)
    }
  },
  methods: {
    selectVariant() {
      console.log(this.selectedVariants)
    },
    getLocalFontCSS(fontFamily) {
      return this.loadLocalFont ? 'local(\'' +  fontFamily + '\'),\n'     : ''
    }
  },
  computed: {

  }
}
</script>

<style scoped>
</style>
