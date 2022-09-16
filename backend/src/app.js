require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const refreshService = require('./service/refreshService')
const {default: axios} = require('axios')

refreshService.start()

const app = express()
app.use(cors())
app.use(express.static('public'))

app.get('/', (req, res) => {
  res.send('Initial Commit!')
})

app.get('/google-webfont-api-data', (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  fs.createReadStream(process.cwd() + '/cache/webfonts.json').pipe(res)
})

app.get('/google-webfont-family', async (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  let returnData = {}
  returnData.success = false

  let googleWebFonts = {}
  try {
    googleWebFonts = JSON.parse(fs.readFileSync(process.cwd() + '/cache/webfonts.json', 'utf8'))
  }
  catch (err) {
    console.error(err)
    returnData.message = 'Failed to read cache'
    res.status(500).send(returnData)
    return
  }

  let baseData = null
  googleWebFonts.items.forEach(value => {
    if(value.family.toLowerCase().replace(/\s/g, '-') === req.query.family.trim().toLowerCase().replace(/\s/g, '-')) {
      baseData = value
    }
  })
  if(baseData == null) {
    returnData.message = 'Font not found'
    res.status(404).send(returnData)
    return
  }

  const webFontLinks = await getFontLinks(baseData.family)

  returnData.fontBase = baseData
  returnData.webFontLinks = webFontLinks
  returnData.success = true
  res.send(returnData)
})

app.listen(process.env.EXPRESS_PORT, () => {
  console.log(`Starting Express on port: ${process.env.EXPRESS_PORT}`)
})

getFontLinks = async (fontFamily) => {
  const userAgents = {
    woff: 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0',
    woff2: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
  }
  const webFontLinks = {
    woff: [],
    woff2: []
  }

  for (const [key, value] of Object.entries(userAgents)) {
    let googleFontCSSResponse = null
    try {
      googleFontCSSResponse = await axios({
        method: 'get',
        url: 'https://fonts.googleapis.com/css',
        headers: {
          'User-Agent': value
        },
        params: {
          family: fontFamily
        }
      })

      const fontURLs = googleFontCSSResponse.data.match(/src: url\((.*\.(woff2?))/i);
      if(fontURLs != null){
        webFontLinks[key].push(fontURLs[1])
      }

    } catch (requestException) {
      console.log(requestException)
    }
  }
  return webFontLinks
}
