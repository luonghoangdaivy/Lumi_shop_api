import authMiddleware from "./auth.middleware.js";

const adminMiddleware = (req, res, next) => {
  // Kiểm tra đăng nhập trước
  authMiddleware(req, res, () => {
    // Kiểm tra role
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền truy cập",
      });
    }

    next();
  });
};

export default adminMiddleware;
