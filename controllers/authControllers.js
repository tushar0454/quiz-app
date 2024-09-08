const { hashPassword, comparePassword } = require("../helpers/auth");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const test = (req, res) => {
  res.json("Everything is working fine");
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name) {
      return res.json({ error: "Name is required" });
    }

    if (!password || password.length < 6) {
      return res.json({
        error: "Password is ewquired and should be at least 6 characters",
      });
    }

    const exist = await User.findOne({ email });
    if (exist) {
      return res.json({ error: "Email already exist" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.json(user);
  } catch (error) {
    console.log(error);
  }
};

//

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ error: "User not found" });
    }

    const isMatch = await comparePassword(password, user.password);
    if (isMatch) {
      const tokenExpiration = "1h";
      jwt.sign(
        { email: user.email, id: user._id, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: tokenExpiration },
        {},
        (err, token) => {
          if (err) throw err;
          res.cookie("token", token).json(user);
        }
      );
    }

    if (!isMatch) {
      return res.json({ error: "Invalid password" });
    }
  } catch (error) {
    console.log(error);
  }
};

const getProfile = (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, {}, (err, user) => {
      if (err) throw err;
      res.json(user);
    });
  } else {
    res.json(null);
  }
};

module.exports = {
  test,
  registerUser,
  loginUser,
  getProfile,
};
