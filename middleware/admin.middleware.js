import { authMiddleware } from "./auth.middleware.js";

const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return authMiddleware(req, res, () => {
      if (req.user?.role !== "ADMIN") {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền truy cập",
        });
      }
      next();
    });
  }

  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Bạn không có quyền truy cập",
    });
  }

  next();
};

export default adminMiddleware;

