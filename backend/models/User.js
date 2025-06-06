const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null }
});

module.exports = mongoose.model("User", UserSchema);
