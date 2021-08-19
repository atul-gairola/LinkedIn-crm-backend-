const router = require("express").Router();
const {
  signupController,
  loginController,
} = require("../controllers/auth.controller");

router.post("/signup", signupController);

router.post("/login", loginController);

module.exports = router;
