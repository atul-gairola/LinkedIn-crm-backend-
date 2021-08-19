const mongoose = require("mongoose");

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    email: { type: String, unique: true },
    password: String,
    accountsAccessed: [
      {
        type: Schema.Types.ObjectId,
        ref: "linkedInUsers",
      },
    ],
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "tags",
      },
    ],
  },
  { timestamps: true }
);

const UserModel = mongoose.model("user", userSchema);

module.exports = UserModel;
