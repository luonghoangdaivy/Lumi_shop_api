import express from "express";

import {
  createReview,
  getReviewsByProduct,
  updateReview,
  deleteReview,
  getAllReviews,
} from "../controllers/review.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const router = express.Router();

// Lấy tất cả đánh giá - chỉ Admin
router.get("/reviews/admin", authMiddleware, adminMiddleware, getAllReviews);

// Tạo đánh giá - yêu cầu đăng nhập
router.post("/products/:productId/reviews", authMiddleware, createReview);

// Lấy đánh giá của một sản phẩm - công khai
router.get("/products/:productId/reviews", getReviewsByProduct);

// Sửa đánh giá - yêu cầu đăng nhập
router.put("/reviews/:id", authMiddleware, updateReview);

// Xóa đánh giá - xử lý quyền trong controller
router.delete("/reviews/:id", authMiddleware, deleteReview);

export default router;
