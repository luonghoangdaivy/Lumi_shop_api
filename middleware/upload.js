import multer from "multer";
import path from "path";
import fs from "fs";

// Tạo thư mục upload nếu chưa tồn tại
const uploadDir = "uploads/products";

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, {
    recursive: true,
  });
}

// Cấu hình nơi lưu file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);

    const fileName = `product-${Date.now()}${ext}`;

    cb(null, fileName);
  },
});

// Kiểm tra loại file
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;

  const ext = path.extname(file.originalname).toLowerCase();

  const mimeType = allowedTypes.test(file.mimetype);

  const extension = allowedTypes.test(ext);

  if (mimeType && extension) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file JPG, JPEG, PNG hoặc WEBP"));
  }
};

// Khởi tạo multer
const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

export default upload;
