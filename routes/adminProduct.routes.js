import express from "express";

import {
  getAllProductsAdmin,
  createProductAdmin,
  updateProductAdmin,
  deleteProductAdmin,
} from "../controllers/adminProduct.controller.js";

import adminMiddleware from "../middleware/admin.middleware.js";

const router = express.Router();

// Lấy tất cả sản phẩm
router.get("/", adminMiddleware, getAllProductsAdmin);

// Tạo sản phẩm
router.post("/", adminMiddleware, createProductAdmin);

// Cập nhật sản phẩm
router.put("/:id", adminMiddleware, updateProductAdmin);

// Xóa sản phẩm
router.delete("/:id", adminMiddleware, deleteProductAdmin);

export default router;
