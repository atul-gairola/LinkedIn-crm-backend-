const mongoose = require("mongoose");

// logger
const { generateLogger, getCurrentFilename } = require("../logger");
const logger = generateLogger(getCurrentFilename(__filename));

mongoose.connect(process.env.DB_CONNECTION_URI_DEV, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const db = mongoose.connection;

// On successful connection
db.on("connected", () => {
  logger.info("Connection established with the DB");
});

// watch change stream for realtime connection
db.once("open", () => {
  const msgCollection = db.collection("messages");
  const changeStream = msgCollection.watch();

  changeStream.on("change", (change) => {
    // console.log(change);
    if (change.operationType === "insert") {
      const msgDetails = change.fullDocument;
      // reads the change stream and send a message
      pusher.trigger("messages", "insert", {
        name: msgDetails.name,
        message: msgDetails.message,
      });
    }
  });
});

// on connection failure
db.on("error", (e) => {
  logger.error("Error connecting to the DB\n", e);
});

// when connection disconnected
db.on("disconnected", () => {
  logger.warn("Mongoose connection disconnected");
});

// if node process ends, close the connection
process.on("SIGINT", () => {
  db.close(() => {
    logger.warn("Connection to the DB disconnected through app termination");
  });
  process.exit(0);
});

module.exports = mongoose;
