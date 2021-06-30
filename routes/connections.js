const router = require("express").Router();

const {
  initializeController,
  getConnectionsController,
  getNextToUpdate,
  updateOneController,
  addConnectionController,
  getAllConnections,
} = require("../controllers/connections.controller");

router.post("/init", initializeController);

router.post("/", addConnectionController);

router.get("/", getConnectionsController);

router.get("/all", getAllConnections);

router.patch("/update/:entityUrn", updateOneController);

router.get("/update/next", getNextToUpdate);

module.exports = router;
