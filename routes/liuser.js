const router = require("express").Router();
const { getAllLinkedInUsers } = require("../controllers/liuser.controller");

router.get("/", getAllLinkedInUsers);

module.exports = router;
