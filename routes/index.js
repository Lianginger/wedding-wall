const path = require('path')
const Card = require('../models/card')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const cloudinary = require('cloudinary').v2
const Datauri = require('datauri')
const imagemin = require('imagemin')
const imageminJpegtran = require('imagemin-jpegtran')
const imageminPngquant = require('imagemin-pngquant')

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

  app.get('/favicon.ico', (req, res) => res.status(204))

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
    console.time('imagemin')
    const compressedImageBuffer = await imagemin.buffer(req.file.buffer, {
      plugins: [
        imageminJpegtran(),
        imageminPngquant({
          quality: [0.6, 0.8]
        })
      ]
    })
    console.timeEnd('imagemin')

    console.time('datauri')
    await datauri.format(path.extname(req.file.originalname).toString(), compressedImageBuffer)
    console.timeEnd('datauri')
    const file = datauri.content

    console.time('cloudinary')
    const result = await cloudinary.uploader.upload(file).then(result => result)
    console.timeEnd('cloudinary')

    console.time('MogodbSave')
    const newCard = new Card({
      name: req.body.name,
      imageId: result.public_id,
      text: req.body.text,
      profilePicId: result.public_id
    })
    await newCard.save()
    console.timeEnd('MogodbSave')

    res.redirect('/')
  })

  app.post('/', async (req, res) => {
    console.log(req.body)
    const newCard = new Card({
      name: req.body.name,
      imageId: req.body.imageId,
      text: req.body.text,
      profilePicId: req.body.profilePicId
    })
    await newCard.save()
    res.json({
      status: 'ok'
    })
  })
}
