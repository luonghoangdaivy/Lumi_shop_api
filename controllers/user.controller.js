import db from "../models/index.js";

const { User } = db;

// Lấy danh sách người dùng
export const getUsers = async (req, res) => {
  try {
    const { search = "", role = "" } = req.query;

    const where = {};

    if (role === "USER" || role === "ADMIN" || role === "CUSTOMER") {
      where.role = role;
    }

    const users = await User.findAll({
      where,
      attributes: [
        "id",
        "name",
        "username",
        "email",
        "phone",
        "address",
        "role",
        "created_at",
      ],
      order: [["created_at", "DESC"]],
    });

    const keyword = search.trim().toLowerCase();

    const filteredUsers = keyword
      ? users.filter(
          (user) =>
            user.name?.toLowerCase().includes(keyword) ||
            user.username?.toLowerCase().includes(keyword) ||
            user.email?.toLowerCase().includes(keyword) ||
            user.phone?.toLowerCase().includes(keyword),
        )
      : users;

    return res.status(200).json({
      success: true,
      data: filteredUsers,
      total: filteredUsers.length,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách người dùng",
    });
  }
};

// Xem chi tiết người dùng
export const getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: [
        "id",
        "name",
        "email",
        "phone",
        "address",
        "role",
        "createdAt",
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
    console.error("Get user detail error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy thông tin người dùng",
    });
  }
};
