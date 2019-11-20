const mongoose = require('mongoose')
module.exports = mongoose.model('Card', {
  name: String,
  imageId: String,
  text: String
})
