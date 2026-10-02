import db from "../models/index.js";

const { Order, OrderItem, ProductVariant, Product, User } = db;

// =========================
// GET ALL ORDERS
// =========================

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
        {
          model: OrderItem,
          as: "items",
          include: [
            {
              model: ProductVariant,
              as: "variant",
              include: [
                {
                  model: Product,
                  as: "product",
                  attributes: ["id", "name", "slug"],
                },
              ],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Get all orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách đơn hàng",
    });
  }
};

// =========================
// UPDATE ORDER STATUS
// =========================

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatus = [
      "PENDING",
      "CONFIRMED",
      "SHIPPING",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái đơn hàng không hợp lệ",
      });
    }

    const order = await Order.findByPk(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    order.status = status;

    // Nếu giao thành công và thanh toán COD
    if (status === "DELIVERED" && order.payment_method === "COD") {
      order.payment_status = "PAID";
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật trạng thái đơn hàng",
    });
  }
};
