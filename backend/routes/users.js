import express from "express";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = express.Router();

router.get("/", (req, res) => res.send("hello"));

router.post(
  "/",
  body("name", "Name cannot be empty").not().isEmpty(),
  body("email", "Please enter a valid email address").isEmail(),
  body("password", "Password must contain atleast 5 characters").isLength({
    min: 5,
  }),
  async (req, res) => {
    const { name, email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ errors: "the user already exists" });
      }
      user = new User({
        name,
        email,
        password,
      });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      user.save();
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
