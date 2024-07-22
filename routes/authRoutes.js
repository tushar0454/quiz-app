const express = require("express");
const router = express.Router();
const cors = require("cors");
const test = require("../controllers/authControllers");

router.use(
  cors({
    Credential: true,
    origin: "http://localhost:3000",
  })
);

router.get("/", test);

module.exports = router;
