var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: String,
  instagram: String,
  facebook: String,
  number: Number,
  fullName: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  resetPasswordToken: String, // create a new model for password resets and include expiry
  resetPasswordExpires: Date, // create a new model for password resets and include expiry
  isAdmin: { type: Boolean, default: false },
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
