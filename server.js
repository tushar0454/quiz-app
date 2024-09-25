const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const http = require("http");
const WebSocketServer = require("websocket").server;

let connection = null;
const app = express();

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Database not connected"));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use("/", require("./routes/authRoutes"));

const port = 8000;
const server = http.createServer(app);

const websocket = new WebSocketServer({
  httpServer: server,
  // autoAcceptConnections: false
});

websocket.on("request", (request) => {
  connection = request.accept(null, request.origin);
  connection.on("open", () => console.log("Opened"));
  connection.on("closed", () => console.log("Closed"));
  connection.on("message", (message) => {
    console.log(`Received message ${message.utf8Data}`);
    connection.send(`Got your message: ${message.utf8Data}`);
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
