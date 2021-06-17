const UserModel = require("../db/models/UserModel");
const LinkedInUserModel = require("../db/models/LinkedInUserModel");
const TagModel = require("../db/models/TagModel");

// logger
const { generateLogger, getCurrentFilename } = require("../logger");
const logger = generateLogger(getCurrentFilename(__filename));

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
    const { name, color } = req.body;
    const { userId } = req.params;

    if (!name || !color) {
      return res.status(400).json({ message: "Incorrect data" });
    }

    // create tag
    const newTag = await TagModel.create({
      name,
      color,
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
