import express from "express";

import { getDashboard } from "../controllers/adminDashboard.controller.js";

import adminMiddleware from "../middleware/admin.middleware.js";

const router = express.Router();

// Dashboard
router.get("/", adminMiddleware, getDashboard);

export default router;
