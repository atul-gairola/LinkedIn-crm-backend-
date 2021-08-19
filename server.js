require("dotenv").config();
require("./db/mongoose");
const express = require("express");
const queue = require("express-queue");
const cors = require("cors");

const connectionsRoutes = require("./routes/connections");
const userRoutes = require("./routes/user");
const liUserRoutes = require("./routes/liuser");
const adminRoutes = require("./routes/admin");
const authRoutes = require("./routes/auth");

// logger
const { generateLogger, getCurrentFilename } = require("./logger");
const logger = generateLogger(getCurrentFilename(__filename));

// app config
const app = express();
const port = process.env.PORT || 8000;

// middlewears
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(queue({ activeLimit: 2, queuedLimit: -1 }));
// app.use(express.urlencoded({ limit: "50mb" }));

// routes
app.use("/auth", authRoutes);
app.use("/connections", connectionsRoutes);
app.use("/user", userRoutes);
app.use("/liuser", liUserRoutes);
app.use("/admin", adminRoutes);

// listener
app.listen(port, () => {
  logger.info(`Mode : ${process.env.NODE_ENV}`);
  logger.info(`SERVER LISTENING ON PORT : ${port}`);
});
