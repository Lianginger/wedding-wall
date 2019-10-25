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

app.get('/', (req, res) => {
  Card.find({}).then(cards => {
    console.log(1, cards)
  })
  res.send('Wedding wall!!!')
})

app.post('/', (req, res) => {
  console.log(req.body)
  const newCard = new Card({
    image: req.body.image,
    text: req.body.text
  })
  newCard.save()
  res.json({
    status: 'ok'
  })
})

app.listen(port, () => {
  console.log(`Express is running on ${port}`)
})
