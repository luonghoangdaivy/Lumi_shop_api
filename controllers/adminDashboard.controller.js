import db from "../models/index.js";
import { Op } from "sequelize";

const { User, Product, Category, Order, OrderItem } = db;

// ======================================
// GET ADMIN DASHBOARD
// ======================================
export const getDashboard = async (req, res) => {
  try {
    // ==============================
    // 1. TỔNG SỐ
    // ==============================

    const totalUsers = await User.count();

    const totalProducts = await Product.count();

    const totalCategories = await Category.count();

    const totalOrders = await Order.count();

    // ==============================
    // 2. ĐƠN HÀNG THEO TRẠNG THÁI
    // ==============================

    const pendingOrders = await Order.count({
      where: {
        status: "PENDING",
      },
    });

    const confirmedOrders = await Order.count({
      where: {
        status: "CONFIRMED",
      },
    });

    const shippingOrders = await Order.count({
      where: {
        status: "SHIPPING",
      },
    });

    const deliveredOrders = await Order.count({
      where: {
        status: "DELIVERED",
      },
    });

    const cancelledOrders = await Order.count({
      where: {
        status: "CANCELLED",
      },
    });

    // ==============================
    // 3. DOANH THU
    // ==============================

    const revenueResult = await Order.sum("total_amount", {
      where: {
        status: "DELIVERED",
      },
    });

    const totalRevenue = Number(revenueResult || 0);

    // ==============================
    // 4. DOANH THU THÁNG HIỆN TẠI
    // ==============================

    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const monthlyRevenueResult = await Order.sum("total_amount", {
      where: {
        status: "DELIVERED",
        created_at: {
          [Op.gte]: startOfMonth,
          [Op.lt]: endOfMonth,
        },
      },
    });

    const monthlyRevenue = Number(monthlyRevenueResult || 0);

    // ==============================
    // 5. ĐƠN HÀNG THÁNG HIỆN TẠI
    // ==============================

    const monthlyOrders = await Order.count({
      where: {
        created_at: {
          [Op.gte]: startOfMonth,
          [Op.lt]: endOfMonth,
        },
      },
    });

    // ==============================
    // 6. SẢN PHẨM ACTIVE
    // ==============================

    const activeProducts = await Product.count({
      where: {
        status: "ACTIVE",
      },
    });

    const inactiveProducts = await Product.count({
      where: {
        status: "INACTIVE",
      },
    });

    // ==============================
    // 7. TRẢ VỀ DASHBOARD
    // ==============================

    return res.status(200).json({
      success: true,

      data: {
        overview: {
          totalUsers,
          totalProducts,
          totalCategories,
          totalOrders,
          totalRevenue,
        },

        revenue: {
          total: totalRevenue,
          currentMonth: monthlyRevenue,
        },

        orders: {
          total: totalOrders,
          currentMonth: monthlyOrders,

          pending: pendingOrders,
          confirmed: confirmedOrders,
          shipping: shippingOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },

        products: {
          total: totalProducts,
          active: activeProducts,
          inactive: inactiveProducts,
        },
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy dữ liệu dashboard",
    });
  }
};
