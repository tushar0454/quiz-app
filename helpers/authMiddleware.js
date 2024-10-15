const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

const requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // console.log("Decoded token:", decoded);

    const user = await UserModel.findById(decoded.id);
    // console.log("User fetched from database:", user);

    if (user && user.role === "admin") {
      req.user = user;
      next();
    } else {
      res.status(403).json({ error: "Forbidden: Admins only" });
    }
  } catch (error) {
    console.error("Error in requireAdmin:", error);
    res.status(401).json({ error: "Unauthorized" });
  }
};

module.exports = { requireAdmin };
