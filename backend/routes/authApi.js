import express from "express";
import userAuthorization from "../middleware/authorization.js";
import User from "../models/User.js";
import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/", userAuthorization, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post(
  "/",

  body("email", "Please enter a valid email address").isEmail(),
  body("password", "Password is Required").exists(),
  async (req, res) => {
    const { email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid username or password" }] });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid username or password" }] });
      }
      const payload = {
        user: {
          id: user._id,
        },
      };
      jwt.sign(payload, "secretKey", { expiresIn: 3600 * 24 }, (err, token) => {
        if (err) {
          throw err;
        } else {
          res.json({ token });
        }
      });
    } catch (error) {
      res.status(500).json({ errors: "Internal Server Error" });
    }
  }
);
export default router;
