const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const CommentSchema = new Schema({
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  createdOn: { type: Date, required: true },
  content: { type: String, required: true },
  parentPost: { type: Schema.Types.ObjectId, ref: "Post", required: true },
});

module.exports = Mongoose.model("Comment", CommentSchema);
