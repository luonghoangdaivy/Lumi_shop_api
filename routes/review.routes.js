import express from "express";

import {
  createReview,
  getReviewsByProduct,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// =========================
// Product Reviews
// =========================

// Lấy danh sách đánh giá của sản phẩm
router.get("/products/:productId/reviews", getReviewsByProduct);

// Tạo đánh giá
router.post("/products/:productId/reviews", authMiddleware, createReview);

// Cập nhật đánh giá
router.put("/reviews/:id", authMiddleware, updateReview);

// Xóa đánh giá
router.delete("/reviews/:id", authMiddleware, deleteReview);

export default router;
