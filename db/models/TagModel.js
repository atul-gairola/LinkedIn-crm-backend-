const mongoose = require("mongoose");

const { Schema } = mongoose;

const tagSchema = new Schema(
  {
    name: String,
    colorName: String,
    colorHex: String,
    description: String,
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  {
    timestamps: true,
  }
);

const TagModel = mongoose.model("tags", tagSchema);

module.exports = TagModel;
