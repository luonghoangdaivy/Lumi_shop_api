import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import db from "../models/index.js";

const { User } = db;

// ======================================================
// REGISTER
// POST /auth/register
// ======================================================
export const register = async (req, res) => {
  try {
    // Hỗ trợ cả frontend gửi name và frontend cũ gửi username
    const { username, name, email, password } = req.body;

    const displayName = String(name ?? username ?? "").trim();
    const normalizedEmail = String(email ?? "")
      .trim()
      .toLowerCase();

    // 1. Kiểm tra dữ liệu bắt buộc
    if (!displayName || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu",
      });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    // 2. Kiểm tra email đã tồn tại
    const existingUser = await User.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email đã được sử dụng",
      });
    }

    // 3. Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Tạo tài khoản
    // Model yêu cầu name nên phải truyền name vào đây.
    const user = await User.create({
      name: displayName,
      username: String(username ?? displayName).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "CUSTOMER",
    });

    // 5. Trả kết quả, không trả password
    return res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error.name, error.message);

    // Lỗi dữ liệu do Sequelize
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu đăng ký không hợp lệ",
        error: error.errors?.map((item) => item.message),
      });
    }

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Email hoặc username đã được sử dụng",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Không thể đăng ký tài khoản",
    });
  }
};

// ======================================================
// LOGIN
// POST /auth/login
// ======================================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Kiểm tra dữ liệu
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email và mật khẩu",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // 2. Tìm user
    const user = await User.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác",
      });
    }

    // 3. Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không chính xác",
      });
    }

    // 4. Kiểm tra JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET chưa được cấu hình");

      return res.status(500).json({
        success: false,
        message: "Server chưa cấu hình JWT_SECRET",
      });
    }

    // 5. Tạo JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // 6. Trả token và thông tin user
    return res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      data: {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken: token,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error.name, error.message);

    return res.status(500).json({
      success: false,
      message: "Không thể đăng nhập",
    });
  }
};

// ======================================================
// GET CURRENT USER
// GET /auth/me
// ======================================================
export const getMe = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Không xác định được người dùng",
      });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: [
        "id",
        "username",
        "name",
        "email",
        "phone",
        "address",
        "role",
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("GET ME ERROR:", error.name, error.message);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin người dùng",
    });
  }
};

// ======================================================
// UPDATE CURRENT USER
// PUT /auth/me
// ======================================================
export const updateMe = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Bạn chưa đăng nhập",
      });
    }

    const userId = req.user.id;
    const { name, phone, address } = req.body;

    // 1. Tìm user
    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    // 2. Kiểm tra họ tên
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Họ và tên không được để trống",
      });
    }

    // 3. Cập nhật thông tin
    user.name = name.trim();
    user.phone = phone && phone.trim() ? phone.trim() : null;
    user.address = address && address.trim() ? address.trim() : null;

    await user.save();

    // 4. Trả thông tin đã cập nhật
    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin thành công",
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("UPDATE USER ERROR:", error.name, error.message);

    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật thông tin người dùng",
    });
  }
};
