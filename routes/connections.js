const router = require("express").Router();

const ConnectionModel = require("../db/models/ConnectionsModel");
const LinkedInUserModel = require("../db/models/LinkedInUserModel");

// logger
const { generateLogger, getCurrentFilename } = require("../logger");
const logger = generateLogger(getCurrentFilename(__filename));

router.post("/init", async (req, res) => {
  const { contacts, userDetails } = req.body;

  const linkedInUser = await LinkedInUserModel.findOne({
    entityUrn: userDetails.entityUrn,
  });

  if (linkedInUser) {
    return res
      .status(201)
      .json({ message: "User Exists", new: false, linkedInUser });
  }

  // create user
  const newLinkedInUser = await LinkedInUserModel.create({
    ...userDetails,
    totalConnections: contacts.length,
  });

  for (contact of contacts) {
    const savedConnection = await ConnectionModel.create({
      ...contact,
      connectionOf: newLinkedInUser._id,
    });

    logger.info(`Saved Connection : ${savedConnection.firstName}`);
  }

  //   console.log("New LinkedIn User");

  return res.status(201).json({ message: "Data recieved", newLinkedInUser });
});

module.exports = router;
