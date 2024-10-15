const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const http = require("http");
const { setupWebSocket } = require("./socket");

const app = express();

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Database connected"))
  .catch((err) => console.log("Database not connected"));

// Routes
app.use("/", require("./routes/authRoutes"));
app.use("/admin", require("./routes/adminRoutes"));
app.use("/room", require("./routes/roomRoutes"));

// HTTP server
const port = process.env.PORT || 8000;
const server = http.createServer(app);

setupWebSocket(server);

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
