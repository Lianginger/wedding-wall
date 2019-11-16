const path = require('path')
const Card = require('../models/card')
const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const cloudinary = require('cloudinary').v2
const Datauri = require('datauri')
const { Storage } = require('@google-cloud/storage')
const gcpstorage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
})
const bucket = gcpstorage.bucket('gcp-wedding-wall')
const sharp = require('sharp')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

function imgUploadGCS(file) {
  return new Promise((resolve, reject) => {
    const gcsname = Date.now()
    const stream = bucket.file(gcsname).createWriteStream({
      metadata: {
        contentType: 'image/jpeg'
      },
      resumable: false
    })

    stream.on('error', err => {
      reject(err)
    })

    stream.on('finish', () => {
      console.log(gcsname)
      resolve(gcsname)
    })

    stream.end(file)
  })
}

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
    if (!req.file || !req.body.name || !req.body.text) {
      const errorMessage = {
        status: 'error',
        title: '每個欄位都要填寫喔！',
        text: '請確認填寫姓名、祝福語及照片。'
      }
      res.render('new', { errorMessage })
    }

    // 檢查檔案大小
    const max_img_size = 4 * 1024 * 1024
    if (req.file.size > max_img_size) {
      const errorMessage = {
        status: 'error',
        title: '喔！圖片太大了',
        text: '圖片大小必須小於 4 MB，請重新選擇一張照片。'
      }
      res.render('new', { errorMessage })
    }

    // 尺寸大於 1280x768 調整尺寸大小
    console.time('croppedImage-sharp')
    const image = sharp(req.file.buffer)
    let imageMetadata = await image.metadata()
    console.log(imageMetadata)
    let croppedImage = req.file.buffer
    let isResize = 0
    if (imageMetadata.height > 768) {
      isResize++
      croppedImage = await image
        .rotate()
        .resize({ height: 768 })
        .toFormat('jpeg')
        .toBuffer()
    }
    imageMetadata = await sharp(croppedImage).metadata()
    if (imageMetadata.width > 1280) {
      isResize++
      croppedImage = await sharp(croppedImage)
        .rotate()
        .resize({ width: 1280 })
        .toFormat('jpeg')
        .toBuffer()
    }
    if (isResize === 0) {
      croppedImage = await image.toFormat('jpeg').toBuffer()
    }
    console.timeEnd('croppedImage-sharp')

    // 調整大小前後差多少
    console.log('isResize', isResize)
    console.log('原始圖片大小', req.file.size)
    const croppedImageMetadata = await sharp(croppedImage).metadata()
    console.log('調整後圖片大小', croppedImageMetadata.size)
    console.log('壓縮率', ((req.file.size - croppedImageMetadata.size) * 100) / req.file.size, '%')

    console.time('gcp-upload')
    await imgUploadGCS(croppedImage)
    console.timeEnd('gcp-upload')

    console.time('datauri')
    const datauri = new Datauri()
    await datauri.format(path.extname(req.file.originalname).toString(), croppedImage)
    console.timeEnd('datauri')
    const file = datauri.content

    console.time('cloudinary')
    const result = await cloudinary.uploader.upload(file, function(error, result) {
      console.log(result, error)
      return result
    })
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

  app.post('/from-chatfuel', async (req, res) => {
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
