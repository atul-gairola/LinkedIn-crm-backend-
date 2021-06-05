const mongoose = require("mongoose");

const { Schema } = mongoose;

const linkedInUserSchema = new Schema({
  entityUrn: String,
  firstName: String,
  lastName: String,
  headline: String,
  publicIdentifier: String,
  profilePicture: String,
  profileId: String,
  location: String,
  country: String,
  industryName: String,
  summary: String,
  totalConnections: Number,
  retrievedConnections: Number,
});

const LinkedInUserModel = mongoose.model("linkedInUsers", linkedInUserSchema);

module.exports = LinkedInUserModel;
