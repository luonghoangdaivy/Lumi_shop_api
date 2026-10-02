import express from "express";

import adminMiddleware from "../middleware/admin.middleware.js";

const router = express.Router();

router.get("/test", adminMiddleware, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Admin API hoạt động",
    admin: req.user,
  });
});

export default router;
