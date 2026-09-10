import express from "express";

import {
  createOrder,
  getOrders,
  updateOrderStatus,
} from "../controllers/orderController";

import protect from "../middleware/authMiddleware";
import admin from "../middleware/adminMiddleware";

const router = express.Router();

router.post("/", protect, createOrder);

router.get("/", protect, getOrders);

router.put("/:id", protect, admin, updateOrderStatus);

export default router;