import express from "express";

import {
  register,
  login,
  getMe,
  updateMe,
} from "../controllers/auth.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

// ===============================
// PUBLIC
// ===============================

router.post("/register", register);

router.post("/login", login);

// ===============================
// PROTECTED
// ===============================

router.get("/me", authMiddleware, getMe);

router.put("/me", authMiddleware, updateMe);

export default router;
