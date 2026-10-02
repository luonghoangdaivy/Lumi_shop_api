import express from "express";

import {
  getCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
} from "../controllers/cart.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Lấy giỏ hàng
router.get("/", authMiddleware, getCart);

// Thêm sản phẩm
router.post("/items", authMiddleware, addCartItem);

// Cập nhật số lượng
router.put("/items/:id", authMiddleware, updateCartItem);

// Xóa sản phẩm
router.delete("/items/:id", authMiddleware, deleteCartItem);

export default router;
