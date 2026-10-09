import express from "express";

import {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
  updateOrderStatus,
} from "../controllers/order.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Tạo đơn hàng
router.post("/", authMiddleware, createOrder);

// Danh sách đơn hàng
router.get("/", authMiddleware, getOrders);

// Cập nhật trạng thái đơn hàng
router.put("/:id/status", authMiddleware, updateOrderStatus);

// Hủy đơn hàng
router.put("/:id/cancel", authMiddleware, cancelOrder);

// Chi tiết đơn hàng
router.get("/:id", authMiddleware, getOrderById);

export default router;
