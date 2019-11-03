const path = require('path')
const Card = require('../models/card')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const cloudinary = require('cloudinary').v2
const Datauri = require('datauri')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

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

  app.post('/cards/new', upload.single('image'), async (req, res) => {
    const datauri = new Datauri()
    await datauri.format(path.extname(req.file.originalname).toString(), req.file.buffer)
    const file = datauri.content
    const result = await cloudinary.uploader.upload(file).then(result => result)

    const newCard = new Card({
      name: req.body.name,
      image: `https://res.cloudinary.com/gingerhouse/image/upload/q_auto/${result.public_id}`,
      text: req.body.text,
      userId: 996,
      profilePicURL: `https://res.cloudinary.com/gingerhouse/image/upload/q_auto/${result.public_id}`
    })
    await newCard.save()
    res.redirect('/')
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
