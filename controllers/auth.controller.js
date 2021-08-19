const UserModel = require("../db/models/UserModel");
const { sign, verify } = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { isEmail, isEmpty } = require("validator");

// logger
const { generateLogger, getCurrentFilename } = require("../logger");
const logger = generateLogger(getCurrentFilename(__filename));

exports.signupController = async (req, res) => {
  const { email, password } = req.body;

  if (!isEmail(email) || isEmpty(email)) {
    return res.status(400).json({ message: "Please enter correct email." });
  }

  if (isEmpty(password)) {
    return res.status(400).json({ message: "Please enter your password." });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password too short." });
  }

  try {
    const userExists = await UserModel.findOne({ email: email });

    if (userExists) {
      return res.status(400).json({ message: "Email exists, please login." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await UserModel.create({
      email: email,
      password: hashedPassword,
    });

    const jwt = sign(
      {
        user_id: newUser.id,
      },
      process.env.JWT_SECRET
    );

    res.json({
      jwt,
      userId: newUser.id,
    });
  } catch (e) {
    logger.error(`Signup controller - ${e}`);
    return res
      .status(500)
      .json({
        message: "Some error occured on our side. Please try after sometime.",
      });
  }
};

exports.loginController = async (req, res) => {};
