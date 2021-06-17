const UserModel = require("../db/models/UserModel");
const LinkedInUserModel = require("../db/models/LinkedInUserModel");

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
