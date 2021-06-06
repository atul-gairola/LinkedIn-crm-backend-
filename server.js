require("dotenv").config();
require("./db/mongoose");
const express = require("express");
const cors = require("cors");

const connectionsRoutes = require("./routes/connections");

// logger
const { generateLogger, getCurrentFilename } = require("./logger");
const logger = generateLogger(getCurrentFilename(__filename));

// app config
const app = express();
const port = process.env.PORT || 8000;

// middlewears
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb" }));

// routes
app.use("/connections", connectionsRoutes);

// listener
app.listen(port, () => {
  logger.info(`Mode : ${process.env.NODE_ENV}`);
  logger.info(`SERVER LISTENING ON PORT : ${port}`);
});
