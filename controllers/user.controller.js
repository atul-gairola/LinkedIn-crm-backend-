const UserModel = require("../db/models/UserModel");
const LinkedInUserModel = require("../db/models/LinkedInUserModel");

exports.loginController = async (req, res) => {
  const { email, googleId } = req.body;

  //   check if user exists
  const userExists = await UserModel.findOne({
    email: email,
    googleId: googleId,
  });

  if (userExists) {
    return res.status(409).json({ message: "user exists", user: userExists });
  }

  const newUser = await UserModel.create({
    email,
    googleId,
  });

  return res
    .status(201)
    .json({ message: "successfully created user", user: newUser });
};
