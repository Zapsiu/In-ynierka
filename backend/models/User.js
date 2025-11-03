const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  age: { type: Number, required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: "Team", default: null },
  role: {
    type: String,
    enum: ["user", "admin", "judge"],
    default: "user"
  }
});

module.exports = mongoose.model("User", UserSchema);
