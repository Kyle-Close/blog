const Mongoose = require("mongoose");
const Schema = Mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  createdOn: { type: Date, required: true },
  isAuthor: { type: Boolean, required: true },
  token: { type: String },
});

module.exports = Mongoose.model("User", UserSchema);
