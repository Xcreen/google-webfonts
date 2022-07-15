const axios = require('axios').default
const fs = require('fs')

let serviceRunning = false
const serviceIntervalTimeout = 15 * 60 * 1000
const googleWebFontAPIUrl = 'https://www.googleapis.com/webfonts/v1/webfonts'

const refreshConfig = async () => {
  console.log('Refeshing Google Webfonts ...')
  try {
    //Request Google Webfont-API
    let googleWebFontResponse = null;
    try {
      googleWebFontResponse = await axios({
        method: 'get',
        url: googleWebFontAPIUrl,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        params: {
          key: process.env.GOOGLE_WEBFONT_API_KEY,
          sort: 'ALPHA'
        }
      })
    } catch (requestException) {
      let extraText = requestException.code
      if (typeof requestException.response !== 'undefined' && typeof requestException.response.status !== 'undefined') {
        extraText = `(${requestException.code} ${requestException.response.status})`
      }
      console.log(`Failed to request ${googleWebFontAPIUrl} ${extraText}`)
      return
    }
    //Save Google-Webfont-Response to disk
    let googleResponseData = JSON.stringify(googleWebFontResponse.data)
    fs.writeFile(process.cwd() + '/cache/webfonts.json', googleResponseData, err => {
      if (err) console.error(err)
      console.log('Successfully refreshed Google Webfonts!')
    })
  }
  catch (ex) {
    console.log(ex)
  }
}

module.exports = {
  start: () => {
    console.log('Starting Refresh-Service')
    serviceRunning = true
    refreshConfig()
    let serviceInterval = setInterval(() => {
      if (!serviceRunning) {
        clearInterval(serviceInterval)
        return
      }
      refreshConfig()
    }, serviceIntervalTimeout)
  },
  stop: () => {
    serviceRunning = false
    console.log('Stopped Refresh-Service')
  }
}

