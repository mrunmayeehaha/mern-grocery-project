
const express = require("express");

const router = express.Router();

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Anyone who is logged in can view products
router.get("/", getProducts);

// Admin only
router.post("/", protect, admin, createProduct);

router.put("/:id", protect, admin, updateProduct);

router.delete("/:id", protect, admin, deleteProduct);

module.exports = router;

