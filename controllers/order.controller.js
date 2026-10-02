import db from "../models/index.js";

const { sequelize, Order, OrderItem, Cart, CartItem, ProductVariant, Product } =
  db;

// =========================
// CREATE ORDER
// =========================

export const createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const userId = req.user.id;

    const { shipping_address, shipping_phone, payment_method } = req.body;

    // =========================
    // 1. Validate dữ liệu
    // =========================

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

    // =========================
    // 2. Lấy Cart
    // =========================

    const cart = await Cart.findOne({
      where: {
        user_id: userId,
      },
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

    // =========================
    // 3. Kiểm tra stock
    // =========================

    for (const item of cart.items) {
      if (!item.variant) {
        await transaction.rollback();

        return res.status(400).json({
          success: false,
          message: "Không tìm thấy biến thể sản phẩm",
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

    // =========================
    // 4. Tính tổng tiền
    // =========================

    let totalAmount = 0;

    for (const item of cart.items) {
      const price = Number(item.variant.product.price);

      totalAmount += price * item.quantity;
    }

    // =========================
    // 5. Tạo Order
    // =========================

    const order = await Order.create(
      {
        user_id: userId,
        total_amount: totalAmount,
        status: "PENDING",
        payment_method,
        payment_status: "PENDING",
        shipping_address,
        shipping_phone,
      },
      {
        transaction,
      },
    );

    // =========================
    // 6. Tạo OrderItems
    // =========================

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
        {
          transaction,
        },
      );

      // =========================
      // 7. Trừ stock
      // =========================

      variant.stock -= item.quantity;

      await variant.save({
        transaction,
      });
    }

    // =========================
    // 8. Xóa CartItems
    // =========================

    await CartItem.destroy({
      where: {
        cart_id: cart.id,
      },
      transaction,
    });

    // =========================
    // 9. Commit transaction
    // =========================

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: "Đặt hàng thành công",
      data: {
        order_id: order.id,
        total_amount: order.total_amount,
        status: order.status,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
      },
    });
  } catch (error) {
    await transaction.rollback();

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
      where: {
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

    // =========================
    // 1. Tìm đơn hàng
    // =========================

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

    // =========================
    // 2. Kiểm tra trạng thái
    // =========================

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

    // =========================
    // 3. Hoàn lại stock
    // =========================

    for (const item of order.items) {
      const variant = await ProductVariant.findByPk(item.variant_id, {
        transaction,
        lock: transaction.LOCK.UPDATE,
      });

      if (variant) {
        variant.stock += item.quantity;

        await variant.save({
          transaction,
        });
      }
    }

    // =========================
    // 4. Cập nhật trạng thái Order
    // =========================

    order.status = "CANCELLED";

    await order.save({
      transaction,
    });

    // =========================
    // 5. Commit
    // =========================

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: "Hủy đơn hàng thành công",
      data: {
        order_id: order.id,
        status: order.status,
      },
    });
  } catch (error) {
    await transaction.rollback();

    console.error("Cancel order error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể hủy đơn hàng",
      error: error.message,
    });
  }
};
