import express from "express";

import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

import upload from "../middleware/upload.js";

const router = express.Router();

router.get("/", getProducts);

router.get("/:id", getProductById);

// Upload tối đa 10 ảnh khi tạo sản phẩm
router.post("/", upload.array("images", 10), createProduct);

// Upload ảnh mới khi cập nhật sản phẩm
router.put("/:id", upload.array("images", 10), updateProduct);

router.delete("/:id", deleteProduct);

export default router;
