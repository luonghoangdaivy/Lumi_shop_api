import express from "express";

import {
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress,
} from "../controllers/address.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// Lấy tất cả địa chỉ
router.get("/", authMiddleware, getAddresses);

// Lấy một địa chỉ
router.get("/:id", authMiddleware, getAddressById);

// Thêm địa chỉ
router.post("/", authMiddleware, createAddress);

// Cập nhật địa chỉ
router.put("/:id", authMiddleware, updateAddress);

// Đặt mặc định
router.put("/:id/default", authMiddleware, setDefaultAddress);

// Xóa địa chỉ
router.delete("/:id", authMiddleware, deleteAddress);

export default router;
