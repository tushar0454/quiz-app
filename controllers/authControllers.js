const { hashPassword, comparePassword } = require("../helpers/auth");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const test = (req, res) => {
  res.json("Everything is working fine");
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name) {
      return res.json({ error: "Name is required" });
    }
    if (!password || password.length < 6) {
      return res.json({
        error: "Password is required and should be at least 6 characters",
      });
    }
    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({ error: "Email already exists" });
    }

    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role,
    });

    // Send user data back, including the role
    return res.json({ user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ error: "User not found" });
    }

    // Compare password
    const isMatch = await comparePassword(password, user.password);
    if (isMatch) {
      const tokenExpiration = "184d";
      jwt.sign(
        { email: user.email, id: user._id, name: user.name, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: tokenExpiration },
        (err, token) => {
          if (err) {
            console.error("Error signing token:", err);
            return res.status(500).json({ error: "Token generation failed" });
          }

          let data = {
            token: token,
            user: user,
          };

          // console.log("Data", data);

          console.log("Generated Token:", token);

          res.json(data);
        }
      );
    } else {
      return res.json({ error: "Invalid password" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Get user profile
const getProfile = (req, res) => {
  // console.log("Inside Profile", req.headers);
  const token = req.headers.authorization?.split(" ")[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
      if (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }
      res.json(user); // Respond with user data
    });
  } else {
    res.status(401).json({ error: "Token not found" });
  }
};

module.exports = {
  test,
  registerUser,
  loginUser,
  getProfile,
};
