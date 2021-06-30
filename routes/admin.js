const router = require("express").Router();

const {
  signupController,
  loginController,
} = require("../controllers/admin.controller");

router.post("/login", loginController);

router.post("/signup", signupController);

module.exports = router;
