const router = require("express").Router();
const { loginController } = require("../controllers/user.controller");

router.post("/login", loginController);

module.exports = router;
