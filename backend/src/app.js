require('dotenv').config()
const express = require('express')
const cors = require('cors')
const fs = require('fs')
const refreshService = require('./service/refreshService')

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

app.listen(process.env.EXPRESS_PORT, () => {
  console.log(`Starting Express on port: ${process.env.EXPRESS_PORT}`)
})
