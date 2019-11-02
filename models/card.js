const mongoose = require('mongoose')
module.exports = mongoose.model('Card', {
  name: String,
  image: String,
  text: String,
  userId: Number,
  profilePicURL: String
})
