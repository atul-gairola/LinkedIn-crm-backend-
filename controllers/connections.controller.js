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

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

exports.initializeController = async (req, res) => {
  try {
    const { contacts, userDetails } = req.body;

    const linkedInUser = await LinkedInUserModel.findOne({
      entityUrn: userDetails.entityUrn,
    });

    if (linkedInUser) {
      res
        .status(201)
        .json({ message: "User Exists", newInit: false, user: linkedInUser });
      return;
    }

    // create user
    const newLinkedInUser = await LinkedInUserModel.create({
      ...userDetails,
      fullName:
        capitalizeFirstLetter(userDetails.firstName) +
        " " +
        capitalizeFirstLetter(userDetails.lastName),
      lastSync: Date.now(),
    });

    let updateLinkedInUser;

    for (contact of contacts) {
      if (contact) {
        const newConnection = await ConnectionModel.create({
          ...contact,
          connectionOf: newLinkedInUser._id,
          fullName: contact.firstName + " " + contact.lastName,
        });

        updatedLinkedInUser = await LinkedInUserModel.findByIdAndUpdate(
          newLinkedInUser._id,
          {
            $inc: { collectedConnections: 1 },
          },
          { new: true }
        );

        logger.info(`Saved Connection : ${newConnection.firstName}`);
      }
    }

    res.status(201).json({
      message: "Data recieved",
      user: updatedLinkedInUser,
      newInit: true,
    });
  } catch (e) {
    logger.error(`Error occured while Initializing : ${e}`);
    res
      .status(500)
      .json({ message: "Internal server error. Please try after sometime." });
  }
};

// -----

exports.addConnectionController = async (req, res) => {
  try {
    const { liuser } = req.headers;
    const { connection } = req.body;

    // check if connection exists
    const connectionExists = await ConnectionModel.findOne({
      connectionOf: liuser,
      entityUrn: connection.entityUrn,
    });

    if (connectionExists) {
      logger.info(`Connection already exists`);
      // if connection exists
      return res.status(409).json({
        message: "Connection exists",
      });
    }

    // create new connection
    const newConnection = await ConnectionModel.create({
      ...connection,
      connectionOf: liuser,
      fullName: connection.firstName + " " + connection.lastName,
    });

    // update linkedInUser
    const updatedUser = await LinkedInUserModel.findByIdAndUpdate(
      liuser,
      {
        $inc: { collectedConnections: 1 },
      },
      { new: true }
    );

    logger.info(
      `Connection (${newConnection._id}) saved to liuser - ${updatedUser._id}`
    );

    return res.status(201).json({
      message: "Connection saved",
      savedConnection: newConnection,
      meta: {
        collectedConnections: updatedUser.collectedConnections,
        totalConnections: updatedUser.totalConnections,
        retrievedConnections: updatedUser.retrievedConnections,
      },
    });
  } catch (e) {
    logger.error(`Error in adding connection : ${e}`);
    return res
      .status(500)
      .json({ message: "Internal server error.Please try after sometime" });
  }
};

exports.getConnectionsController = async (req, res) => {
  try {
    const { start, count, sortBy, sortOrder, search } = req.query;

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

    if (search) {
      find = {
        ...find,
        $or: [
          { fullName: { $regex: `${search}`, $options: "i" } },
          { headline: { $regex: `${search}`, $options: "i" } },
          { location: { $regex: `${search}`, $options: "i" } },
          { company: { $regex: `${search}`, $options: "i" } },
          { companyTitle: { $regex: `${search}`, $options: "i" } },
          { "contact.emailAddress": { $regex: `${search}`, $options: "i" } },
          { "contact.address": { $regex: `${search}`, $options: "i" } },
          { industryName: { $regex: `${search}`, $options: "i" } },
          { country: { $regex: `${search}`, $options: "i" } },
        ],
      };
    }

    const totalCount = await ConnectionModel.countDocuments(find);

    const results = await ConnectionModel.find(find)
      .sort(sort)
      .skip(Number(start))
      .limit(Number(count))
      .populate("tags");

    res.status(200).json({
      data: { count: results.length, connections: results },
      meta: { totalResults: totalCount, start: start, limit: count },
    });
  } catch (e) {
    logger.error(`Error while getting connections : ${e}`);
    res
      .status(500)
      .json({ message: "Internal server error. Please try after sometime." });
  }
};

// -----

exports.getNextToUpdate = async (req, res) => {
  try {
    const results = await ConnectionModel.find({
      $or: [{ retrieved: null }, { retrieved: false }],
    })
      .sort({ connectedAt: -1 })
      .limit(1);

    res.status(200).json({ next: results[0] });
  } catch (e) {
    logger.error(`Error while getting nextToUpdate : ${e}`);
    res
      .status(500)
      .json({ message: "Internal server error. Please try after sometime." });
  }
};

// -----

exports.updateOneController = async (req, res) => {
  try {
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

    console.log("Body --------");

    const connection = await ConnectionModel.findOne({
      entityUrn,
      connectionOf: liuser,
    });

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
    ).populate("tags").exec();

    const updatedUser = await LinkedInUserModel.findByIdAndUpdate(
      liuser,
      connection.retrieved ? {} : { $inc: { retrievedConnections: 1 } },
      { new: true }
    )

    console.log(updatedConnection);

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
  } catch (e) {
    logger.error(`Error in updating one connection : ${e}`);
    res
      .status(500)
      .json({ message: "Internal server error. Please try after sometime." });
  }
};

// -----

exports.deleteOneController = async (req, res) => {
  try {
    const { entityUrn } = req.params;
    const { liuser } = req.headers;

    const deletedConnection = await ConnectionModel.findOneAndDelete({
      connectionOf: liuser,
      entityUrn,
    });

    await LinkedInUserModel.findByIdAndUpdate(liuser, {
      $inc: {
        totalConnections: -1,
        retrievedConnections: deletedConnection.retrieved ? -1 : 0,
      },
    });

    res.status(200).json({ message: "Deleted successfully" });
  } catch (e) {
    logger.error(`Error in deleting one connection : ${e}`);
    res
      .status(500)
      .json({ message: "Internal server error. Please try after sometime" });
  }
};

// -----

exports.synchronize = async (req, res) => {
  const { contacts } = req.body;
  const { liuser } = req.headers;
};
