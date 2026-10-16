import express from "express";
import { getUsers, getUserById } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import adminMiddleware from "../middleware/admin.middleware.js";

const router = express.Router();

// Tất cả API bên dưới yêu cầu đăng nhập và quyền Admin
router.use(authMiddleware, adminMiddleware);

// GET /users - Lấy danh sách người dùng
router.get("/", getUsers);

// GET /users/:id - Lấy chi tiết người dùng theo ID
router.get("/:id", getUserById);

export default router;
