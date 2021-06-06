const ConnectionModel = require("../db/models/ConnectionsModel");
const LinkedInUserModel = require("../db/models/LinkedInUserModel");

// logger
const { generateLogger, getCurrentFilename } = require("../logger");
const logger = generateLogger(getCurrentFilename(__filename));

/**
 * @desc Updates the whole connections of the linked in user
 * @param {*} req - Request object
 * @param {*} res - Response object
 */

exports.initializeController = async (req, res) => {
  const { contacts, userDetails } = req.body;

  const linkedInUser = await LinkedInUserModel.findOne({
    entityUrn: userDetails.entityUrn,
  });

  if (linkedInUser) {
    res.status(201).json({ message: "User Exists", new: false, linkedInUser });
    return;
  }

  // create user
  const newLinkedInUser = await LinkedInUserModel.create({
    ...userDetails,
    totalConnections: contacts.length,
    fullName: userDetails.firstName + " " + userDetails.lastName,
  });

  for (contact of contacts) {
    if (contact) {
      const savedConnection = await ConnectionModel.findOne({
        connectionOf: newLinkedInUser._id,
        entityUrn: contact.entityUrn,
      });

      if (savedConnection) {
        console.log("Connection saved");
        continue;
      }

      const newConnection = await ConnectionModel.create({
        ...contact,
        connectionOf: newLinkedInUser._id,
        fullName: contact.firstName + " " + contact.lastName,
      });

      logger.info(`Saved Connection : ${newConnection.firstName}`);
    }
  }

  //   console.log("New LinkedIn User");

  res.status(201).json({ message: "Data recieved", newLinkedInUser });
};

// -----

exports.getConnectionsController = async (req, res) => {
  const { start, count, sortBy, sortOrder, searchIn, search } = req.query;

  const { liuser } = req.headers;

  // Sorting
  let sort = {
    connectedAt: -1,
  };

  if (sortBy && sortOrder) {
    sort = {
      [sortBy]: Number(sortOrder),
    };
  }

  // search
  let find = { connectionOf: liuser };
  let findMeta = {};

  if (searchIn && search) {
    find = { ...find, [searchIn]: { $regex: `${search}`, $options: "i" } };
  }

  const results = await ConnectionModel.find(find, findMeta)
    .sort(sort)
    .skip(Number(start))
    .limit(Number(count));

  res.status(200).json({ length: results.length, results });
};
