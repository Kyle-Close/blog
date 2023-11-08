const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const allowedCategories = ['web dev', 'gaming', 'electronics'];

const CategorySchema = new Schema({
  category: {
    type: String,
    required: true,
    enum: allowedCategories.map((category) => category.toLowerCase()),
    set: (value) => value.toLowerCase(),
    get: (value) => value.toLowerCase(),
  },
});

module.exports = Mongoose.model('Category', CategorySchema);
