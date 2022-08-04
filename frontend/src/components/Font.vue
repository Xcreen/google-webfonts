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

      <div class="text-center" :class="{ 'd-none': !loading }">
        <i class="fa-3x fa-solid fa-sync fa-spin"></i>
      </div>

      <div class="alert alert-danger d-flex align-items-center" :class="{ 'd-none': !errorMessage }" role="alert">
        <i class="fa-solid fa-triangle-exclamation me-2"></i> <div>{{ errorMessage }}</div>
      </div>

      <div :class="{ 'd-none':loading || errorMessage }">

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
            <div class="mb-3">
                <label for="custom-folder-input" class="form-label">Custom folder</label>
                <input type="text" class="form-control" id="custom-folder-input" v-model="folderPrefix">
            </div>
            <div class="mb-1">
              <label for="custom-font-dispay-select" class="form-label">Font-Display Property</label>
              <select class="form-control" v-model="fontDisplayProperty" id="custom-font-dispay-select">
                <option value="swap">Swap</option>
                <option value="auto">Auto</option>
                <option value="block">Block</option>
                <option value="fallback">Fallback</option>
                <option value="optional">Optional</option>
              </select>
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
  font-display: {{ fontDisplayProperty }};
  font-style: {{ getFontStyleCSS(fontVariant) }};
  font-weight: {{ getFontWeightCSS(fontVariant) }};
  src: {{ getLocalFontCSS(googleWebFont.family) }}url('{{ folderPrefix }}/abeezee-v22-latin-regular.woff2') format('woff2'),
       url('{{ folderPrefix }}/abeezee-v22-latin-regular.woff') format('woff');
}
</code></pre>
            </div>
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
      folderPrefix: '../fonts',
      fontDisplayProperty: 'swap',
      loading: true,
      errorMessage: null
    }
  },
  async mounted() {
    try {
      const googleWebFontResponse = await axios({
        method: 'get',
        url: this.$apiURL + 'google-webfont-family',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        params: {
          'family': this.$route.params.fontFamily.trim()
        }
      })
      this.googleWebFont = googleWebFontResponse.data.fontBase
      this.selectedVariants.push('regular')
      this.loading = false

      console.log(googleWebFontResponse.data)
    } catch (requestException) {
      let extraText = requestException.code
      if (typeof requestException.response !== 'undefined' && typeof requestException.response.status !== 'undefined') {
        extraText = `(${requestException.code} ${requestException.response.status})`
      }
      this.loading = false
      this.errorMessage = 'Failed to request api!'
      console.log(`Failed to request ${this.$apiURL} ${extraText}`)
    }
  },
  methods: {
    selectVariant() {
      console.log(this.selectedVariants)
    },
    getLocalFontCSS(fontFamily) {
      return this.loadLocalFont ? 'local(\'' +  fontFamily + '\'),\n       ': ''
    },
    getFontStyleCSS(fontVariant){
      let fontStyle = 'normal'
      if(fontVariant.includes('italic')) {
        fontStyle = 'italic'
      }
      if(fontVariant.includes('oblique')) {
        fontStyle = 'oblique'
      }
      return fontStyle
    },
    getFontWeightCSS(fontVariant) {
      if(fontVariant === 'regular' || fontVariant === 'italic') {
        return 400
      }
      else {
        return fontVariant.replace(/\D+/g, '')
      }
    }
  },
  computed: {

  }
}
</script>

<style scoped>
</style>
