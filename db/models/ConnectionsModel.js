const mongoose = require("mongoose");

const { Schema } = mongoose;

const connectionSchema = new Schema(
  {
    connectionOf: {
      type: Schema.Types.ObjectId,
      ref: "linkedInUsers",
      index: true,
    },
    entityUrn: { type: String, index: true },
    firstName: String,
    lastName: String,
    fullName: { type: String, text: true },
    headline: String,
    publicIdentifier: String,
    connectedAt: Number,
    profilePicture: String,
    profileId: String,
    contact: {
      address: String,
      emailAddress: String,
      phoneNumbers: [String],
    },
    location: String,
    country: String,
    industryName: String,
    summary: String,
    company: String,
    companyTitle: String,
    retrieved: Boolean,
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "tags",
      },
    ],
  },
  { timestamps: true }
);

const ConnectionModel = mongoose.model("connections", connectionSchema);

module.exports = ConnectionModel;
