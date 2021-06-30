const UserModel = require("../db/models/UserModel");
const TagModel = require("../db/models/TagModel");
const ConnectionModel = require("../db/models/ConnectionsModel");

// logger
const { generateLogger, getCurrentFilename } = require("../logger");
const logger = generateLogger(getCurrentFilename(__filename));

exports.getAllUsers = async (req, res) => {
  try {
    const { start, count, sortBy, sortOrder, search } = req.query;
    if (!start || !count) {
      return res.status(400).json({ message: "Missing queries" });
    }
    // Sorting
    let sort = {
      createdAt: -1,
    };

    if (sortBy && sortOrder) {
      sort = {
        [sortBy]: Number(sortOrder),
      };
    }

    let find = {};

    if (search) {
      find = {
        ...find,
        $or: [
          {
            email: { $regex: `${search}`, $options: "i" },
          },
        ],
      };
    }

    const totalCount = await UserModel.countDocuments(find);
    const users = await UserModel.find(find)
      .sort(sort)
      .skip(Number(start))
      .limit(Number(count))
      .populate("accountsAccessed")
      .populate("tags");

    return res.status(200).json({
      data: { resultCount: users.length, users },
      meta: { totalResults: totalCount, start: start, limit: count },
    });
  } catch (e) {
    logger.error(`Error in getting all linked in users : ${e}`);
    res
      .status(500)
      .json({ message: "Internal server error. Please try after sometime" });
  }
};

exports.loginController = async (req, res) => {
  try {
    const { email, googleId } = req.body;

    //   check if user exists
    const userExists = await UserModel.findOne({
      email: email,
      googleId: googleId,
    });

    if (userExists) {
      logger.info(`User exists : ${userExists._id}`);
      return res.json({ message: "user exists", user: userExists });
    }

    const newUser = await UserModel.create({
      email,
      googleId,
    });

    logger.info(`New user created : ${newUser._id}`);

    return res
      .status(201)
      .json({ message: "successfully created user", user: newUser });
  } catch (e) {
    logger.error(`Error while creating user : ${e}`);
    res
      .status(500)
      .json({ message: "Internal server error. Please try after sometime" });
  }
};

exports.createTagController = async (req, res) => {
  try {
    const { name, colorHex, colorName, description } = req.body;
    const { userId } = req.params;

    if (!name || !colorName) {
      return res.status(400).json({ message: "Incorrect data" });
    }

    // create tag
    const newTag = await TagModel.create({
      name,
      colorHex,
      colorName,
      description,
      user: userId,
    });

    // update user
    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          tags: newTag._id,
        },
      },
      {
        new: true,
      }
    );

    logger.info(`New tag created : ${newTag._id}`);

    res.status(201).json({ message: "New tag created", tags: newTag });
  } catch (e) {
    logger.error(`Error while creating tag : ${e}`);
    res
      .status(500)
      .json({ message: "Internal server error. Please try after sometime" });
  }
};

exports.getAllTagsController = async (req, res) => {
  try {
    const { userId } = req.params;

    const tags = await TagModel.find({ user: userId });

    res.status(201).json({ tags: tags });
  } catch (e) {
    logger.error(`Error while getting tags : ${e}`);
    res
      .status(500)
      .json({ message: "Internal server error. Please try after sometime" });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    const { userId, tagId } = req.params;

    const deletedTag = await TagModel.findByIdAndDelete(tagId);

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      {
        $pull: { tags: tagId },
      },
      { new: true }
    );

    const updatedConnections = await ConnectionModel.updateMany(
      { tags: tagId },
      {
        $pull: { tags: tagId },
      },
      { new: true }
    );

    res.status(200).json({ deletedTag });
  } catch (e) {
    logger.error(`Error while deleting tag : ${e}`);
    res
      .status(500)
      .json({ message: "Internal server error. Please try after sometime" });
  }
};

exports.updateTag = async (req, res) => {
  try {
    const { userId, tagId } = req.params;
    const { name, color } = req.body;

    const updatedTag = await TagModel.findByIdAndUpdate(
      tagId,
      {
        name,
        color,
      },
      {
        new: true,
      }
    );

    res.status(200).json({ updatedTag });
  } catch (e) {
    logger.error(`Error while updating tag : ${e}`);
    res
      .status(500)
      .json({ message: "Internal server error. Please try after sometime" });
  }
};

exports.applyTag = async (req, res) => {
  try {
    const { connectionId, tagId } = req.params;

    const updatedConnection = await ConnectionModel.findByIdAndUpdate(
      connectionId,
      {
        $push: {
          tags: tagId,
        },
      }
    );
    res.status(200).json({ updatedConnection });
  } catch (e) {
    logger.error(`Error while updating tag : ${e}`);
    res
      .status(500)
      .json({ message: "Internal server error. Please try after sometime" });
  }
};

exports.removeTag = async (req, res) => {
  try {
    const { userId, tagId, connectionId } = req.params;

    const updatedConnection = await ConnectionModel.findByIdAndUpdate(
      connectionId,
      {
        $pull: {
          tags: tagId,
        },
      }
    );
    res.status(200).json({ updatedConnection });
  } catch (e) {
    logger.error(`Error while updating tag : ${e}`);
    res
      .status(500)
      .json({ message: "Internal server error. Please try after sometime" });
  }
};
