const router = require("express").Router();

const {
  signupController,
  loginController,
  checkController,
} = require("../controllers/admin.controller");

router.post("/login", loginController);

router.post("/signup", signupController);

router.get("/check", checkController);

module.exports = router;
