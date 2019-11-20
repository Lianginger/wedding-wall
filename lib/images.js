const Multer = require('multer')
const multer = Multer({ storage: Multer.memoryStorage() })

const sharp = require('sharp')
async function cropAndCompress(file, width, height) {
  console.time('cropAndCompressTime')
  const image = sharp(file.buffer)
  let imageMetadata = await image.metadata()
  console.log(imageMetadata)

  let processedImageBuffer = file.buffer
  let isResize = 0
  if (imageMetadata.height > height) {
    isResize++
    processedImageBuffer = await image
      .rotate()
      .resize({ height: height })
      .toFormat('jpeg')
      .toBuffer()
  }
  imageMetadata = await sharp(processedImageBuffer).metadata()
  if (imageMetadata.width > width) {
    isResize++
    processedImageBuffer = await sharp(processedImageBuffer)
      .rotate()
      .resize({ width: width })
      .toFormat('jpeg')
      .toBuffer()
  }
  if (isResize === 0) {
    processedImageBuffer = await image.toFormat('jpeg').toBuffer()
  }
  console.timeEnd('cropAndCompressTime')

  console.log('===============================')
  console.log('長、寬裁切幾次：', isResize)
  console.log('原始圖片大小：', file.size)
  const processedImageBufferMetadata = await sharp(processedImageBuffer).metadata()
  console.log('調整後圖片大小：', processedImageBufferMetadata.size)
  console.log('壓縮率：', ((file.size - processedImageBufferMetadata.size) * 100) / file.size, '%')
  console.log('===============================')

  return processedImageBuffer
}

const { Storage } = require('@google-cloud/storage')
const storage = new Storage({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
})
const bucket = storage.bucket('gcp-wedding-wall')
function uploadToGCS(bufferFile) {
  console.time('uploadToGCS-time')
  return new Promise((resolve, reject) => {
    const gcsname = Date.now()
    const stream = bucket.file(gcsname).createWriteStream({
      metadata: {
        contentType: 'image/jpeg'
      },
      resumable: false
    })

    stream.on('error', err => {
      console.timeEnd('uploadToGCSTime')
      reject(err)
    })

    stream.on('finish', () => {
      console.log(gcsname)
      console.timeEnd('uploadToGCSTime')
      resolve(gcsname)
    })

    stream.end(bufferFile)
  })
}

module.exports = {
  multer,
  cropAndCompress,
  uploadToGCS
}
