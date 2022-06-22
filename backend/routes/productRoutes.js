import express from "express";
import userAuthorization from "../middleware/authorization.js";
import { body, validationResult } from "express-validator";
import Product from "../models/Product.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).send("internal server error");
  }
});

//get product by id

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      return res.status(200).json(product);
    }
    res.status(400).json({ msg: "product not found" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post(
  "/",
  [
    userAuthorization,
    body("name", "name is required").not().isEmpty(),

    body("description", "description is required").not().isEmpty(),
    body("price", "price is required").not().isEmpty(),
    body("quantity", "quantity is required").not().isEmpty(),
    body("category", "category is required").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, price, description, quantity, category } = req.body;
      const newProduct = new Product({
        userId: req.user.id,
        name,
        price,
        description,
        quantity,
        category,
      });
      const product = await newProduct.save();
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "internal server error" });
    }
  }
);
export default router;
