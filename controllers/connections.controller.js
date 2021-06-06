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

  if (searchIn && search) {
    find = { ...find, [searchIn]: { $regex: `${search}`, $options: "i" } };
  }

  const totalCount = await ConnectionModel.count(find);

  const results = await ConnectionModel.find(find)
    .sort(sort)
    .skip(Number(start))
    .limit(Number(count));

  res.status(200).json({
    data: { count: results.length, connections: results },
    meta: { totalResults: totalCount, start: start, limit: count },
  });
};

// -----

exports.getNextToUpdate = async (req, res) => {
  const results = await ConnectionModel.find({
    $or: [{ retrieved: null }, { retrieved: false }],
  })
    .sort({ connectedAt: -1 })
    .limit(1);

  res.status(200).json({ next: results[0] });
};

// -----

exports.updateOneController = async (req, res) => {
  const { entityUrn } = req.params;
  const {
    location,
    country,
    industryName,
    summary,
    firstName,
    lastName,
    company,
    companyTitle,
    profileId,
    address,
    emailAddress,
    phoneNumbers,
  } = req.body;
  const { liuser } = req.headers;

  const updatedConnection = await ConnectionModel.findOneAndUpdate(
    { entityUrn, connectionOf: liuser },
    {
      location,
      country,
      industryName,
      summary,
      company,
      companyTitle,
      profileId,
      contact: {
        address,
        emailAddress,
        phoneNumbers,
      },
      retrieved: true,
    },
    { new: true }
  );

  const updatedUser = await LinkedInUserModel.findByIdAndUpdate(
    liuser,
    { $inc: { retrievedConnections: 1 } },
    { new: true }
  );

  res.status(201).json({
    meta: {
      retrieved: updatedUser.retrievedConnections,
      total: updatedUser.totalConnections,
      left: updatedUser.totalConnections - updatedUser.retrievedConnections,
    },
    data: {
      update: updatedConnection,
    },
  });
};
