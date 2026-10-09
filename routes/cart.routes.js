import express from "express";

import {
  getCart,
  addCartItem,
  updateCartItem,
  deleteCartItem,
} from "../controllers/cart.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// ======================================
// LẤY GIỎ HÀNG
// GET /cart
// ======================================

router.get("/", authMiddleware, getCart);

// ======================================
// THÊM SẢN PHẨM VÀO GIỎ
// POST /cart/items
// ======================================

router.post("/items", authMiddleware, addCartItem);

// ======================================
// CẬP NHẬT SỐ LƯỢNG
// PUT /cart/items/:id
// ======================================

router.put("/items/:id", authMiddleware, updateCartItem);

// ======================================
// XÓA SẢN PHẨM
// DELETE /cart/items/:id
// ======================================

router.delete("/items/:id", authMiddleware, deleteCartItem);

export default router;
