import express from "express";

import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
} from "../controllers/order.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Tạo đơn hàng
router.post("/", authMiddleware, createOrder);

// Danh sách đơn hàng
router.get("/", authMiddleware, getOrders);

// Chi tiết đơn hàng
router.get("/:id", authMiddleware, getOrderById);

// Hủy đơn hàng
router.put("/:id/cancel", authMiddleware, cancelOrder);

export default router;
