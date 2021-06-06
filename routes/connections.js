const router = require("express").Router();

const {
  initializeController,
  getConnectionsController,
  getNextToUpdate,
} = require("../controllers/connections.controller");

router.post("/init", initializeController);

router.get("/", getConnectionsController);

router.get("/update/next", getNextToUpdate);

module.exports = router;
