import db from "../models/index.js";

const { Product, ProductVariant } = db;

// GET /products/:productId/variants
export const getVariantsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    const variants = await ProductVariant.findAll({
      where: {
        product_id: productId,
      },
      order: [["id", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: variants,
    });
  } catch (error) {
    console.error("Get variants error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách biến thể",
    });
  }
};

// GET /products/:productId/variants/:id
export const getVariantById = async (req, res) => {
  try {
    const { productId, id } = req.params;

    const variant = await ProductVariant.findOne({
      where: {
        id,
        product_id: productId,
      },
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy biến thể",
      });
    }

    res.status(200).json({
      success: true,
      data: variant,
    });
  } catch (error) {
    console.error("Get variant error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể lấy biến thể",
    });
  }
};

// POST /products/:productId/variants
export const createVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const { color, size, stock } = req.body;

    // Kiểm tra Product
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Kiểm tra dữ liệu
    if (!color || !size || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Color, size và stock là bắt buộc",
      });
    }

    if (stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock không được nhỏ hơn 0",
      });
    }

    // Kiểm tra variant trùng
    const existingVariant = await ProductVariant.findOne({
      where: {
        product_id: productId,
        color,
        size,
      },
    });

    if (existingVariant) {
      return res.status(409).json({
        success: false,
        message: "Biến thể này đã tồn tại",
      });
    }

    const variant = await ProductVariant.create({
      product_id: productId,
      color,
      size,
      stock,
    });

    res.status(201).json({
      success: true,
      message: "Tạo biến thể thành công",
      data: variant,
    });
  } catch (error) {
    console.error("Create variant error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể tạo biến thể",
    });
  }
};

// PUT /products/:productId/variants/:id
export const updateVariant = async (req, res) => {
  try {
    const { productId, id } = req.params;
    const { color, size, stock } = req.body;

    const variant = await ProductVariant.findOne({
      where: {
        id,
        product_id: productId,
      },
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy biến thể",
      });
    }

    if (stock !== undefined && stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock không được nhỏ hơn 0",
      });
    }

    // Kiểm tra trùng color + size
    if ((color && color !== variant.color) || (size && size !== variant.size)) {
      const existingVariant = await ProductVariant.findOne({
        where: {
          product_id: productId,
          color: color ?? variant.color,
          size: size ?? variant.size,
        },
      });

      if (existingVariant && existingVariant.id !== variant.id) {
        return res.status(409).json({
          success: false,
          message: "Biến thể này đã tồn tại",
        });
      }
    }

    await variant.update({
      color: color ?? variant.color,
      size: size ?? variant.size,
      stock: stock ?? variant.stock,
    });

    res.status(200).json({
      success: true,
      message: "Cập nhật biến thể thành công",
      data: variant,
    });
  } catch (error) {
    console.error("Update variant error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể cập nhật biến thể",
    });
  }
};

// DELETE /products/:productId/variants/:id
export const deleteVariant = async (req, res) => {
  try {
    const { productId, id } = req.params;

    const variant = await ProductVariant.findOne({
      where: {
        id,
        product_id: productId,
      },
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy biến thể",
      });
    }

    await variant.destroy();

    res.status(200).json({
      success: true,
      message: "Xóa biến thể thành công",
    });
  } catch (error) {
    console.error("Delete variant error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể xóa biến thể",
    });
  }
};
