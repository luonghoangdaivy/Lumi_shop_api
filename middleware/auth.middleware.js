import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Không có Authorization
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập",
      });
    }

    // Không đúng format Bearer
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    // Lấy token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy token",
      });
    }

    // Kiểm tra JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET chưa được cấu hình");

      return res.status(500).json({
        success: false,
        message: "Server chưa cấu hình JWT_SECRET",
      });
    }

    // Giải mã và kiểm tra JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("JWT decoded:", decoded);

    // Lưu thông tin user vào request
    req.user = decoded;

    // Cho request chạy tiếp
    next();
  } catch (error) {
    console.error("=================================");
    console.error("AUTH MIDDLEWARE ERROR");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("=================================");

    // Token hết hạn
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token đã hết hạn",
      });
    }

    // Token sai
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Xác thực thất bại",
    });
  }
};
