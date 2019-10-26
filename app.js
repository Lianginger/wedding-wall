const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const port = process.env.PORT || 3000

mongoose.set('debug', true)
mongoose.connect('mongodb://localhost:27017/wedding-wall', { useNewUrlParser: true })
const db = mongoose.connection

db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log('Mongodb is connected!')
})

const Card = mongoose.model('Card', {
  image: String,
  text: String
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', async (req, res) => {
  const cards = await Card.find({}).exec()
  res.json(cards)
})

app.post('/', async (req, res) => {
  console.log(req.body)
  const newCard = new Card({
    image: req.body.image,
    text: req.body.text
  })
  await newCard.save()
  res.json({
    status: 'ok'
  })
})

app.listen(port, () => {
  console.log(`Express is running on ${port}`)
})
