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

        <h2 class="display-6 text-center mb-3">{{ googleWebFont.family }} <small><i>{{ googleWebFont.category }}</i></small></h2>

        <div class="row">
          <div class="col-sm-4">
            <h4>Select Styles</h4>
            <div v-for="fontVariant in googleWebFont.variants" class="mb-1 form-check">
              <input type="checkbox" class="form-check-input"
                     :id="'font-variant-checkbox-' + fontVariant" :value="fontVariant"
                     v-model="selectedVariants">
              <label class="form-check-label" :for="'font-variant-checkbox-' + fontVariant">{{ fontVariant }}</label>
            </div>
            <h4>Other</h4>
            <div class="mb-3 form-check">
              <input type="checkbox" class="form-check-input" id="load-local-font-checkbox"
                     v-model="loadLocalFont">
              <label class="form-check-label" for="load-local-font-checkbox">Load font from system, if it´s available</label>
            </div>
            <div class="mb-3">
                <label for="custom-folder-input" class="form-label">Custom folder</label>
                <input type="text" class="form-control" id="custom-folder-input" v-model="folderPrefix">
            </div>
            <div class="mb-3">
              <label for="custom-font-dispay-select" class="form-label">Font-Display Property</label>
              <select class="form-control" v-model="fontDisplayProperty" id="custom-font-dispay-select">
                <option value="swap">Swap</option>
                <option value="auto">Auto</option>
                <option value="block">Block</option>
                <option value="fallback">Fallback</option>
                <option value="optional">Optional</option>
              </select>
            </div>
            <button @click="downloadFont" class="btn btn-primary">
              <i class="fa-solid fa-download"></i> Download Font
            </button>
          </div>
          <div class="col-sm-8">
            <h4>Copy Font-CSS</h4>

            <div class="card">
              <div class="card-header">
                <i class="fa-brands fa-css3"></i> CSS-Code
              </div>
              <div class="card-body">
                <pre class="css-code" v-html="getCSSCode"></pre>
              </div>
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
import hljs from 'highlight.js/lib/core'
import hljsCSS from 'highlight.js/lib/languages/css'

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
  beforeMount() {
    hljs.registerLanguage('css', hljsCSS)
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
    getLocalFontCSS(fontFamily) {
      return this.loadLocalFont ? 'local(\'' +  fontFamily + '\'),': ''
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
    },
    getFontFileNameCSS(fontFamily, fontVariant) {
      return `${this.getBaseFontFileName(fontFamily)}-${this.googleWebFont.version}-${fontVariant}`
    },
    getBaseFontFileName(fontFamily) {
      return fontFamily.toLowerCase().replace(/\s/g, '-')
    },
    downloadFont() {
      let downloadEndpoint = this.$apiURL + 'download/'
      let downloadFamily = '?family=' + this.getBaseFontFileName(this.googleWebFont.family)
      let downloadVariants = '&variants=' + this.selectedVariants.join(',')
      let downloadLink = downloadEndpoint + downloadFamily + downloadVariants
      window.open(downloadLink, '_blank').focus()
    }
  },
  computed: {
    getCSSCode() {
      let cssCode = ''
      this.selectedVariants.forEach((fontVariant) => {
        cssCode += `/* ${this.googleWebFont.family } ${this.getFontStyleCSS(fontVariant) } ${this.getFontWeightCSS(fontVariant) } */
@font-face {
  font-family: '${this.googleWebFont.family }';
  font-display: ${this.fontDisplayProperty};
  font-style: ${this.getFontStyleCSS(fontVariant)};
  font-weight: ${this.getFontWeightCSS(fontVariant)};
  src: ${this.getLocalFontCSS(this.googleWebFont.family)}
       url('${ this.folderPrefix }/${ this.getFontFileNameCSS(this.googleWebFont.family, fontVariant) }.woff2') format('woff2'),
       url('${ this.folderPrefix }/${ this.getFontFileNameCSS(this.googleWebFont.family, fontVariant) }.woff') format('woff');
}

`
      })
      return hljs.highlight(cssCode, {language: 'css'}).value
    }
  }
}
</script>

<style scoped>
</style>
