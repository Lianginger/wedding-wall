const Card = require('../models/card')

module.exports = app => {
  app.get('/', async (req, res) => {
    const cards = await Card.find({})
      .sort({ _id: -1 })
      .exec()
    res.render('home', { cards })
  })

  app.get('/slideshow', async (req, res) => {
    const cards = await Card.find({})
      .sort({ _id: -1 })
      .exec()
    res.render('slideshow', { cards })
  })

  app.get('/cards/new', (req, res) => {
    res.render('new')
  })

  app.post('/', async (req, res) => {
    console.log(req.body)
    const newCard = new Card({
      name: req.body.name,
      image: req.body.image,
      text: req.body.text,
      userId: req.body.userId,
      profilePicURL: req.body.profilePicURL
    })
    await newCard.save()
    res.json({
      status: 'ok'
    })
  })
}
