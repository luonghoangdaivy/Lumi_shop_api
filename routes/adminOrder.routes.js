import express from "express";

import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/adminOrder.controller.js";

import adminMiddleware from "../middleware/admin.middleware.js";

const router = express.Router();

// Xem tất cả đơn hàng
router.get("/", adminMiddleware, getAllOrders);

// Chi tiết đơn hàng cho Admin
router.get("/:id", adminMiddleware, getOrderById);

// Cập nhật trạng thái đơn hàng
router.put("/:id/status", adminMiddleware, updateOrderStatus);

export default router;

