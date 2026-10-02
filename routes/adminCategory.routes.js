import express from "express";

import {
  getAllCategoriesAdmin,
  createCategoryAdmin,
  updateCategoryAdmin,
  deleteCategoryAdmin,
} from "../controllers/adminCategory.controller.js";

import adminMiddleware from "../middleware/admin.middleware.js";

const router = express.Router();

// Lấy danh sách category
router.get("/", adminMiddleware, getAllCategoriesAdmin);

// Tạo category
router.post("/", adminMiddleware, createCategoryAdmin);

// Cập nhật category
router.put("/:id", adminMiddleware, updateCategoryAdmin);

// Xóa category
router.delete("/:id", adminMiddleware, deleteCategoryAdmin);

export default router;
