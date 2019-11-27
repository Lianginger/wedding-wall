const Card = require('../models/card')
const images = require('../lib/images')

module.exports = app => {
  app.get('/', async (req, res) => {
    const cards = await Card.find({})
      .sort({ _id: -1 })
      .exec()
    res.render('home', { cards })
  })

  app.get('/admin', async (req, res) => {
    const cards = await Card.find({})
      .sort({ _id: -1 })
      .exec()
    res.render('admin', { cards })
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

  app.post('/card-delete', async (req, res) => {
    await Card.findOneAndDelete({ _id: req.body.cardId })
    res.redirect('/home-admin')
  })

  app.post('/cards/new', images.multer.single('image'), async (req, res) => {
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

    // 調整尺寸大小，寬、高小於 1280x768，最後壓縮成 JPG 檔
    const processedImageBuffer = await images.cropAndCompress(req.file, 1280, 768)
    const uploadedFileId = await images.uploadToGCS(processedImageBuffer)

    console.time('MongoDBSaveTime')
    const newCard = new Card({
      name: req.body.name,
      imageId: uploadedFileId,
      text: req.body.text
    })
    await newCard.save()
    console.timeEnd('MongoDBSaveTime')

    res.redirect('/')
  })
}
