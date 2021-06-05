const mongoose = require("mongoose");

const { Schema } = mongoose;

const connectionSchema = new Schema({
  connectionOf: {
    type: Schema.Types.ObjectId,
    ref: "LinkedInUser",
  },
  entityUrn: String,
  firstName: String,
  lastName: String,
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
});

const ConnectionModel = mongoose.model("connections", connectionSchema);

module.exports = ConnectionModel;
