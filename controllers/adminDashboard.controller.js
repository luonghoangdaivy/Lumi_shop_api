import db from "../models/index.js";
import { Op } from "sequelize";

const { User, Product, Category, Order } = db;

export const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const startOfMonth = new Date(year, now.getMonth(), 1);
    const endOfMonth = new Date(year, now.getMonth() + 1, 1);
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year + 1, 0, 1);

    const [
      totalUsers,
      totalProducts,
      totalCategories,
      totalOrders,
      pending,
      confirmed,
      shipping,
      delivered,
      cancelled,
      totalRevenueResult,
      monthlyRevenueResult,
      monthlyOrders,
      activeProducts,
      inactiveProducts,
      recentOrderRows,
      yearlyDeliveredOrders,
    ] = await Promise.all([
      User.count(),
      Product.count(),
      Category.count(),
      Order.count(),
      Order.count({ where: { status: "PENDING" } }),
      Order.count({ where: { status: "CONFIRMED" } }),
      Order.count({ where: { status: "SHIPPING" } }),
      Order.count({ where: { status: "DELIVERED" } }),
      Order.count({ where: { status: "CANCELLED" } }),
      Order.sum("total_amount", {
        where: { status: "DELIVERED" },
      }),
      Order.sum("total_amount", {
        where: {
          status: "DELIVERED",
          created_at: {
            [Op.gte]: startOfMonth,
            [Op.lt]: endOfMonth,
          },
        },
      }),
      Order.count({
        where: {
          created_at: {
            [Op.gte]: startOfMonth,
            [Op.lt]: endOfMonth,
          },
        },
      }),
      Product.count({ where: { status: "ACTIVE" } }),
      Product.count({ where: { status: "INACTIVE" } }),
      Order.findAll({
        order: [["created_at", "DESC"]],
        limit: 5,
      }),
      Order.findAll({
        where: {
          status: "DELIVERED",
          created_at: {
            [Op.gte]: startOfYear,
            [Op.lt]: endOfYear,
          },
        },
        attributes: ["created_at", "total_amount"],
      }),
    ]);

    const totalRevenue = Number(totalRevenueResult || 0);
    const monthlyRevenue = Number(monthlyRevenueResult || 0);
    const byMonth = Array(12).fill(0);

    yearlyDeliveredOrders.forEach((order) => {
      const createdAt = order.created_at || order.createdAt;
      if (!createdAt) return;

      const month = new Date(createdAt).getMonth();
      byMonth[month] += Number(order.total_amount ?? order.totalAmount ?? 0);
    });

    const recentOrders = await Promise.all(
      recentOrderRows.map(async (order) => {
        const data = order.toJSON();
        const userId = data.user_id ?? data.userId;

        const user = userId
          ? await User.findByPk(userId, {
              attributes: ["id", "name"],
            })
          : null;

        return {
          ...data,
          user: user ? user.toJSON() : null,
        };
      }),
    );

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
          byMonth,
        },
        orders: {
          total: totalOrders,
          currentMonth: monthlyOrders,
          pending,
          confirmed,
          shipping,
          delivered,
          cancelled,
        },
        products: {
          total: totalProducts,
          active: activeProducts,
          inactive: inactiveProducts,
        },
        recentOrders,
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
