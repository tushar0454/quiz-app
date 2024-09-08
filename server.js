const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const http = require("http");
const setupSocket = require("./socket");

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
const server = http.createServer(app); // Create an HTTP server

setupSocket(server); // Set up WebSocket connections

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
