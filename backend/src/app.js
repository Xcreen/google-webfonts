require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const refreshService = require('./service/refreshService')
const {default: axios} = require('axios')
const JSZip = require('jszip')

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

  returnData.fontBase = baseData
  returnData.success = true
  res.send(returnData)
})

app.get('/download', async (req, res) => {
  if(typeof req.query.family === 'undefined') {
    res.status(400).send('Font-Family is missing!')
    return
  }
  if(typeof req.query.variants === 'undefined') {
    res.status(400).send('Font-Variants is missing!')
    return
  }

  let googleWebFonts = {}
  try {
    googleWebFonts = JSON.parse(fs.readFileSync(process.cwd() + '/cache/webfonts.json', 'utf8'))
  }
  catch (err) {
    console.error(err)
    res.status(500).send('Failed to read cache')
    return
  }

  let baseData = null
  googleWebFonts.items.forEach(value => {
    if(value.family.toLowerCase().replace(/\s/g, '-') === req.query.family.trim().toLowerCase().replace(/\s/g, '-')) {
      baseData = value
    }
  })
  if(baseData == null) {
    res.status(404).send('Font not found')
    return
  }

  const webFontLinks = await getFontLinks(baseData.family, req.query.variants)
  const webFontFilenames = []

  let downloadError = false
  for (const [key, value] of Object.entries(webFontLinks)) {
    for(let linkIndex in webFontLinks[key]) {
      let fontFileName = await getFontFilename(baseData.family, baseData.version, webFontLinks[key][linkIndex]['weight'], webFontLinks[key][linkIndex]['style'], key)
      webFontFilenames.push(fontFileName)
      let downloadSuccess = await downloadFont(webFontLinks[key][linkIndex]['url'], fontFileName)
      if(!downloadSuccess) downloadError = true
    }
  }
  if(downloadError) {
    res.status(500).send('Font-Download failed!')
    return
  }

  const zip = new JSZip()
  for(let index in webFontFilenames) {
    let fontBlob = fs.readFileSync(process.cwd() + '/public/fonts/' + webFontFilenames[index])
    zip.file(webFontFilenames[index], fontBlob);
  }
  let downloadFilename = baseData.family + '-' + baseData.version + ".zip"
  res.header('Content-Disposition', 'attachment; filename="' + downloadFilename + '"');
  zip.generateNodeStream({type: 'nodebuffer', streamFiles: true}).pipe(res)
})

app.listen(process.env.EXPRESS_PORT, () => {
  console.log(`Starting Express on port: ${process.env.EXPRESS_PORT}`)
})

getFontFilename = async(fontFamily, fontVersion, fontWeight, fontStyle, fontExtension) => {
  let font = fontFamily.toLowerCase().replace(/\s/g, '-')
  if(fontStyle === 'normal') {
    fontStyle = fontWeight === 400 ? 'regular' : ''
  }
  if(fontWeight === 400) {
    fontWeight = ''
  }
  let fontvariante = fontWeight + fontStyle
  return font + '-' + fontVersion + '-' + fontvariante + '.' + fontExtension
}

downloadFont = async (link, filename) => {
  let downloadPromise = new Promise(async (resolve, reject) => {
    let fontDownloadResponse = null
    try {
      fontDownloadResponse = await axios({
        url: link,
        method: 'GET',
        responseType: 'stream',
      })
      try {
        const writer = fs.createWriteStream(process.cwd() + '/public/fonts/' + filename)
        writer.on('error', () => {
          console.log('Failed to save font ' + filename)
          resolve(false)
        })
        writer.on('finish', () => {
          console.log('Saved font ' + filename)
          resolve(true)
        })
        fontDownloadResponse.data.pipe(writer)
      }
      catch (writeException) {
        console.log(writeException)
        resolve(false)
      }
    }
    catch (requestException) {
      console.log(requestException)
      resolve(false)
    }
  })

  return await downloadPromise
}

getFontLinks = async (fontFamily, fontVariants = '') => {
  const userAgents = {
    woff: 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0',
    woff2: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
  }
  const webFontLinks = {
    woff: [],
    woff2: []
  }

  let familyParameter = fontFamily
  if(fontVariants.length > 0) {
    familyParameter += ':' + fontVariants
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
          family: familyParameter
        }
      })

      let googleFontResponseArr = googleFontCSSResponse.data.split('\n')
      let latinBlock = false
      let fontWeight = 400
      let fontStyle = 'normal'
      for(let cssLine in googleFontResponseArr) {
        if(googleFontResponseArr[cssLine].startsWith('/*')) {
          latinBlock = false
          if(googleFontResponseArr[cssLine].includes('/* latin */')) {
            latinBlock = true
          }
        }
        if(latinBlock || key === 'woff') {
          const fontWeightMatch = googleFontResponseArr[cssLine].match(/font-weight: (.*);/i)
          if(fontWeightMatch != null){
            fontWeight = fontWeightMatch[1]
          }
          const fontStyleMatch = googleFontResponseArr[cssLine].match(/font-style: (.*);/i)
          if(fontStyleMatch != null){
            fontStyle = fontStyleMatch[1]
          }

          const fontURL = googleFontResponseArr[cssLine].match(/src: url\((.*\.(woff2?))/i)
          if(fontURL != null){
            const fontData = {
              url: fontURL[1],
              style: fontStyle,
              weight: parseInt(fontWeight)
            }
            webFontLinks[key].push(fontData)
            latinBlock = false
          }
        }
      }
    } catch (requestException) {
      console.log(requestException)
    }
  }
  return webFontLinks
}
