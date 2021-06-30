const mongoose = require("mongoose");

const { Schema } = mongoose;

const adminUserSchema = new Schema(
  {
    email: { type: String, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: {
      type: String,
      required: true,
      default: "basic",
      enum: ["basic", "admin", "superadmin"],
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("adminUser", adminUserSchema);

module.exports = UserModel;
