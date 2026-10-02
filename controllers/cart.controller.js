import db from "../models/index.js";

const { Cart, CartItem, ProductVariant, Product } = db;

// =========================
// GET CART
// =========================

export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Tìm cart của user
    let cart = await Cart.findOne({
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
    });

    // Nếu user chưa có cart → tạo mới
    if (!cart) {
      cart = await Cart.create({
        user_id: userId,
      });

      // Lấy lại cart kèm items
      cart = await Cart.findByPk(cart.id, {
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
      });
    }

    return res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    console.error("Get cart error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy giỏ hàng",
    });
  }
};

// =========================
// ADD ITEM TO CART
// =========================

export const addCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { variant_id, quantity } = req.body;

    // 1. Kiểm tra dữ liệu
    if (!variant_id || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập variant_id và quantity",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Số lượng phải lớn hơn 0",
      });
    }

    // 2. Tìm variant
    const variant = await ProductVariant.findByPk(variant_id);

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy biến thể sản phẩm",
      });
    }

    // 3. Kiểm tra tồn kho
    if (variant.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Sản phẩm chỉ còn ${variant.stock} sản phẩm`,
      });
    }

    // 4. Tìm cart của user
    let cart = await Cart.findOne({
      where: {
        user_id: userId,
      },
    });

    // Nếu chưa có cart thì tạo
    if (!cart) {
      cart = await Cart.create({
        user_id: userId,
      });
    }

    // 5. Kiểm tra variant đã có trong cart chưa
    const existingItem = await CartItem.findOne({
      where: {
        cart_id: cart.id,
        variant_id,
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      // Kiểm tra tổng số lượng không vượt stock
      if (newQuantity > variant.stock) {
        return res.status(400).json({
          success: false,
          message: `Không thể thêm. Kho chỉ còn ${variant.stock} sản phẩm`,
        });
      }

      existingItem.quantity = newQuantity;

      await existingItem.save();

      return res.status(200).json({
        success: true,
        message: "Đã cập nhật số lượng sản phẩm trong giỏ hàng",
        data: existingItem,
      });
    }

    // 6. Tạo CartItem mới
    const cartItem = await CartItem.create({
      cart_id: cart.id,
      variant_id,
      quantity,
    });

    return res.status(201).json({
      success: true,
      message: "Thêm sản phẩm vào giỏ hàng thành công",
      data: cartItem,
    });
  } catch (error) {
    console.error("Add cart item error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể thêm sản phẩm vào giỏ hàng",
    });
  }
};

// =========================
// UPDATE CART ITEM
// =========================

export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;

    // 1. Kiểm tra quantity
    if (!quantity || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Số lượng phải lớn hơn 0",
      });
    }

    // 2. Tìm cart của user
    const cart = await Cart.findOne({
      where: {
        user_id: userId,
      },
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giỏ hàng",
      });
    }

    // 3. Tìm item trong cart
    const cartItem = await CartItem.findOne({
      where: {
        id,
        cart_id: cart.id,
      },
      include: [
        {
          model: ProductVariant,
          as: "variant",
        },
      ],
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm trong giỏ hàng",
      });
    }

    // 4. Kiểm tra stock
    if (quantity > cartItem.variant.stock) {
      return res.status(400).json({
        success: false,
        message: `Kho chỉ còn ${cartItem.variant.stock} sản phẩm`,
      });
    }

    // 5. Cập nhật quantity
    cartItem.quantity = quantity;

    await cartItem.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật giỏ hàng thành công",
      data: cartItem,
    });
  } catch (error) {
    console.error("Update cart item error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật giỏ hàng",
    });
  }
};

// =========================
// DELETE CART ITEM
// =========================

export const deleteCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // 1. Tìm giỏ hàng của user
    const cart = await Cart.findOne({
      where: {
        user_id: userId,
      },
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy giỏ hàng",
      });
    }

    // 2. Tìm sản phẩm trong giỏ hàng
    const cartItem = await CartItem.findOne({
      where: {
        id,
        cart_id: cart.id,
      },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm trong giỏ hàng",
      });
    }

    // 3. Xóa
    await cartItem.destroy();

    return res.status(200).json({
      success: true,
      message: "Xóa sản phẩm khỏi giỏ hàng thành công",
    });
  } catch (error) {
    console.error("Delete cart item error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể xóa sản phẩm khỏi giỏ hàng",
    });
  }
};
