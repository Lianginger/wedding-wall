const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const port = process.env.PORT || 3000

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.send('Wedding wall!!!')
})

app.post('/', (req, res) => {
  console.log(req.body)
  res.json({
    status: 'ok'
  })
})

app.listen(port, () => {
  console.log(`Express is running on ${port}`)
})
