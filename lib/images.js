const multer = require('multer')
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const { Storage } = require('@google-cloud/storage')
const gcpstorage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
})
const bucket = gcpstorage.bucket('gcp-wedding-wall')
const sharp = require('sharp')
