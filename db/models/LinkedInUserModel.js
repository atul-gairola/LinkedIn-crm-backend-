const mongoose = require("mongoose");

const { Schema } = mongoose;

const linkedInUserSchema = new Schema(
  {
    entityUrn: { type: String, unique: true },
    firstName: String,
    lastName: String,
    fullName: String,
    headline: String,
    publicIdentifier: String,
    profilePicture: String,
    profileId: String,
    location: String,
    country: String,
    industryName: String,
    summary: String,
    connections: [{ entityUrn: String }],
    totalConnections: Number,
    retrievedConnections: Number,
  },
  { timestamps: true }
);

const LinkedInUserModel = mongoose.model("linkedInUsers", linkedInUserSchema);

module.exports = LinkedInUserModel;
