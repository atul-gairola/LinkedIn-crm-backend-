require("dotenv").config();
require("./db/mongoose");
const express = require("express");
const cors = require("cors");

// logger
const { generateLogger, getCurrentFilename } = require("./logger");
const logger = generateLogger(getCurrentFilename(__filename));

// app config
const app = express();
const port = process.env.PORT || 8000;

// middlewears
app.use(express.json());
app.use(cors());

// listener
app.listen(port, () => {
  logger.info("Mode : ", process.env.NODE_ENV);
  logger.info("SERVER LISTENING ON PORT : ", port);
});
