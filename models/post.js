const Mongoose = require('mongoose');
const Schema = Mongoose.Schema;

const PostSchema = new Schema({
  title: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdOn: { type: Date, required: true },
  content: { type: String, required: true },
  isPublished: { type: Boolean, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
});

module.exports = Mongoose.model('Post', PostSchema);
