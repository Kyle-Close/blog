const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const allowedCategories = ['web dev', 'gaming', 'electronics'];

const CategorySchema = new Schema({
  category: {
    type: String,
    required: true,
    enum: allowedCategories,
  },
});

module.exports = Mongoose.model('Category', CategorySchema);
