const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const PopularPostsSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
});

module.exports = Mongoose.model("PopularPosts", PopularPostsSchema);
