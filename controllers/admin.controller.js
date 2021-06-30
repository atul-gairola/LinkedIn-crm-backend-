const bcrypt = require("bcrypt");
const { sign, verify } = require("jsonwebtoken");

const AdminUserModel = require("../db/models/AdminUserModel");

exports.signupController = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName } = req.body;
  try {
    const exists = await AdminUserModel.findOne({ email: email });
    if (!exists) {
      if (confirmPassword !== password) {
        return res.status(400).json({ message: "Passwords don't match" });
      }
      const hash = await bcrypt.hash(password, 10);
      const newUser = new AdminUserModel({
        email: email,
        firstName,
        lastName,
        password: hash,
        role: "basic",
      });

      const savedUser = await newUser.save();

      const jwt = sign(
        { user_id: savedUser.id, role: savedUser.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );

      res.json({
        message: "Signed Up",
        jwt,
        role: savedUser.role,
      });
    } else {
      res.statusCode = 409;
      res.json({ message: "Email already in use" });
    }
  } catch (e) {
    console.log(e);
    res.statusCode = 500;
    res.json({ message: "Server side error. Please try after some time." });
  }
};

exports.loginController = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await AdminUserModel.findOne({ email: email });
    console.log(user.role);
    if (user && user.role !== "admin" && user && user.role !== "superadmin") {
      return res.status(409).json({
        message: "This account has not been permitted admin access yet.",
      });
    }
    const matched = await bcrypt.compare(password, user.password);
    if (matched) {
      const jwt = sign(
        { user_id: user.id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );
      res.json({
        message: "Admin user login success",
        jwt: jwt,
        role: user.role,
      });
    } else {
      res.statusCode = 401;
      return res.json({ message: "Email or password incorrect" });
    }
  } catch (e) {
    console.log(e);
    res.statusCode = 500;
    res.json({ message: "Server side error. Please try after some time." });
  }
};
