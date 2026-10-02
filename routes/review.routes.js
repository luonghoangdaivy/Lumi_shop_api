import express from "express";

import {
  createReview,
  getReviewsByProduct,
  updateReview,
  deleteReview,
} from "../controllers/review.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

// Tạo review
router.post("/products/:productId/reviews", authMiddleware, createReview);

// Lấy review của sản phẩm
router.get("/products/:productId/reviews", getReviewsByProduct);

// Sửa review
router.put("/reviews/:id", authMiddleware, updateReview);

// Xóa review
router.delete("/reviews/:id", authMiddleware, deleteReview);

export default router;
