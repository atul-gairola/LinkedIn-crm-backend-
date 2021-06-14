const router = require("express").Router();

const {
  initializeController,
  getConnectionsController,
  getNextToUpdate,
  updateOneController,
  addConnectionController,
} = require("../controllers/connections.controller");

router.post("/init", initializeController);

router.post("/", addConnectionController);

router.get("/", getConnectionsController);

router.patch("/update/:entityUrn", updateOneController);

router.get("/update/next", getNextToUpdate);

module.exports = router;
