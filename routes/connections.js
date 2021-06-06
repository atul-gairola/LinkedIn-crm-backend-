const router = require("express").Router();

const {
  initializeController,
  getConnectionsController,
} = require("../controllers/connections.controller");

router.post("/init", initializeController);

router.get("/", getConnectionsController);

module.exports = router;
