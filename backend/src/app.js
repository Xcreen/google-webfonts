const express = require('express')
const app = express()
const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.send('Initial Commit!')
})

app.listen(port, () => {
  console.log(`Starting on port: ${port}`)
})
