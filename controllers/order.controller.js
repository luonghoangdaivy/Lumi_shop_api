import db from "../models/index.js";
import generateOrderCode from "../utils/generateOrderCode.js";
import { sendOrderConfirmation } from "../utils/sendOrderConfirmation.js";

const {
  sequelize,
  User,
  Order,
  OrderItem,
  Cart,
  CartItem,
  ProductVariant,
  Product,
} = db;

// =========================
// CREATE ORDER
// =========================

export const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { shipping_address, shipping_phone, payment_method } = req.body;

    if (!shipping_address || !shipping_phone) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập địa chỉ và số điện thoại",
      });
    }

    if (!["COD", "ONLINE"].includes(payment_method)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Phương thức thanh toán không hợp lệ",
      });
    }

    // Lấy giỏ hàng
    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [
        {
          model: CartItem,
          as: "items",
          include: [
            {
              model: ProductVariant,
              as: "variant",
              include: [
                {
                  model: Product,
                  as: "product",
                },
              ],
            },
          ],
        },
      ],
      transaction,
    });

    if (!cart || cart.items.length === 0) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Giỏ hàng đang trống",
      });
    }

    // Kiểm tra tồn kho
    for (const item of cart.items) {
      if (!item.variant || !item.variant.product) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: "Không tìm thấy biến thể hoặc sản phẩm",
        });
      }

      if (item.quantity > item.variant.stock) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: `Sản phẩm "${item.variant.product.name}" không đủ số lượng trong kho`,
        });
      }
    }

    const user = await User.findByPk(userId, {
      attributes: ["id", "email", "name"],
      transaction,
    });

    // Tính tổng tiền
    let totalAmount = 0;

    for (const item of cart.items) {
      const price = Number(item.variant.product.price);
      totalAmount += price * item.quantity;
    }

    // Tạo đơn hàng với mã ngẫu nhiên
    const order = await Order.create(
      {
        order_code: generateOrderCode(),
        user_id: userId,
        total_amount: totalAmount,
        status: "PENDING",
        payment_method,
        payment_status: "PENDING",
        shipping_address,
        shipping_phone,
      },
      { transaction },
    );

    // Tạo chi tiết đơn hàng và trừ tồn kho
    for (const item of cart.items) {
      const variant = item.variant;
      const product = variant.product;
      const price = Number(product.price);
      const subtotal = price * item.quantity;

      await OrderItem.create(
        {
          order_id: order.id,
          variant_id: variant.id,
          product_name: product.name,
          color: variant.color,
          size: variant.size,
          price,
          quantity: item.quantity,
          subtotal,
        },
        { transaction },
      );

      variant.stock -= item.quantity;
      await variant.save({ transaction });
    }

    // Xóa sản phẩm khỏi giỏ hàng
    await CartItem.destroy({
      where: { cart_id: cart.id },
      transaction,
    });

    await transaction.commit();

    // Gửi email sau khi đơn hàng đã được lưu thành công.
    // Email lỗi không làm đơn hàng bị tạo thất bại.
    try {
      await sendOrderConfirmation(
        user,
        order,
        cart.items.map((item) => ({
          product_name: item.variant.product.name,
          color: item.variant.color,
          size: item.variant.size,
          quantity: item.quantity,
          subtotal: Number(item.variant.product.price) * item.quantity,
        })),
      );
    } catch (emailError) {
      console.error("Send order confirmation email error:", emailError);
    }

    return res.status(201).json({
      success: true,
      message: "Đặt hàng thành công",
      data: {
        order_id: order.id,
        order_code: order.order_code,
        total_amount: order.total_amount,
        status: order.status,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
      },
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("Create order error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể tạo đơn hàng",
      error: error.message,
    });
  }
};

// =========================
// GET MY ORDERS
// =========================

export const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
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
                  attributes: ["id", "name", "slug", "price"],
                  include: [
                    {
                      model: db.ProductImage,
                      as: "images",
                      attributes: ["id", "image_url", "is_primary"],
                    },
                  ],
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
    console.error("Get orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách đơn hàng",
      error: error.message,
    });
  }
};

// =========================
// GET ORDER DETAIL
// =========================

export const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Giữ nguyên id làm khóa tìm kiếm nội bộ.
    const order = await Order.findOne({
      where: {
        id,
        user_id: userId,
      },
      include: [
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
                  attributes: ["id", "name", "slug", "price"],
                  include: [
                    {
                      model: db.ProductImage,
                      as: "images",
                      attributes: ["id", "image_url", "is_primary"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Get order detail error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy chi tiết đơn hàng",
    });
  }
};

// =========================
// CANCEL ORDER
// =========================

export const cancelOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { id } = req.params;

    const order = await Order.findOne({
      where: {
        id,
        user_id: userId,
      },
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
      transaction,
    });

    if (!order) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (order.status === "CANCELLED") {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Đơn hàng đã được hủy",
      });
    }

    if (order.status === "SHIPPING" || order.status === "DELIVERED") {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Không thể hủy đơn hàng ở trạng thái hiện tại",
      });
    }

    // Hoàn lại số lượng hàng
    for (const item of order.items) {
      const variant = await ProductVariant.findByPk(item.variant_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (variant) {
        variant.stock += item.quantity;
        await variant.save({ transaction });
      }
    }

    order.status = "CANCELLED";
    await order.save({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Hủy đơn hàng thành công",
      data: {
        order_id: order.id,
        order_code: order.order_code,
        status: order.status,
      },
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("Cancel order error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể hủy đơn hàng",
      error: error.message,
    });
  }
};

// =========================
// UPDATE ORDER STATUS - ADMIN
// =========================

export const updateOrderStatus = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedTransitions = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["SHIPPING", "CANCELLED"],
      SHIPPING: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
    };

    const allowedStatuses = [
      "PENDING",
      "CONFIRMED",
      "SHIPPING",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: "Trạng thái đơn hàng không hợp lệ",
      });
    }

    const order = await Order.findByPk(id, {
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });

    if (!order) {
      await transaction.rollback();

      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (!allowedTransitions[order.status]?.includes(status)) {
      await transaction.rollback();

      return res.status(400).json({
        success: false,
        message: `Không thể chuyển đơn hàng từ ${order.status} sang ${status}`,
      });
    }

    // Nếu hủy đơn, hoàn lại hàng vào kho
    if (status === "CANCELLED") {
      for (const item of order.items) {
        const variant = await ProductVariant.findByPk(item.variant_id, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (variant) {
          variant.stock += item.quantity;
          await variant.save({ transaction });
        }
      }
    }

    order.status = status;
    await order.save({ transaction });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: {
        order_id: order.id,
        order_code: order.order_code,
        status: order.status,
      },
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật trạng thái đơn hàng",
      error: error.message,
    });
  }
};
