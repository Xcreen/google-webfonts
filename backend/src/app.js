require('dotenv').config()
const express = require('express')
const refreshService = require('./service/refreshService')

const app = express()

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.send('Initial Commit!')
})

refreshService.start()

app.listen(process.env.EXPRESS_PORT, () => {
  console.log(`Starting Express on port: ${process.env.EXPRESS_PORT}`)
})
