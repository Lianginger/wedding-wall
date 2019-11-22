if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config() // 使用 dotenv 讀取 .env 檔案
}
const fs = require('fs')
fs.writeFile('./google-credentials-heroku.json', process.env.GOOGLE_CONFIG, err => {})
