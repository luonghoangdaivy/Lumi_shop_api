import db from "../models/index.js";

const { Product, Category, ProductVariant, ProductImage } = db;

// ===============================
// GET ALL PRODUCTS - ADMIN
// ===============================
export const getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: "category",
          attributes: ["id", "name", "slug"],
        },
        {
          model: ProductVariant,
          as: "variants",
        },
        {
          model: ProductImage,
          as: "images",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Admin get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách sản phẩm",
    });
  }
};

// ===============================
// CREATE PRODUCT - ADMIN
// ===============================
export const createProductAdmin = async (req, res) => {
  try {
    const { name, slug, description, price, category_id, status } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!name || !slug || !price || !category_id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ tên, slug, giá và category",
      });
    }

    // Kiểm tra category
    const category = await Category.findByPk(category_id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    // Kiểm tra slug trùng
    const existingProduct = await Product.findOne({
      where: { slug },
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Slug sản phẩm đã tồn tại",
      });
    }

    // Kiểm tra giá tiền
    if (Number(price) < 0) {
      return res.status(400).json({
        success: false,
        message: "Giá sản phẩm không được nhỏ hơn 0",
      });
    }

    // Tạo sản phẩm
    const product = await Product.create({
      name,
      slug,
      description,
      price,
      category_id,
      status: status || "ACTIVE",
    });

    return res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    console.error("Admin create product error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể tạo sản phẩm",
    });
  }
};

// ===============================
// UPDATE PRODUCT - ADMIN
// ===============================
export const updateProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, slug, description, price, category_id, status } = req.body;

    // Tìm sản phẩm
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Nếu có category_id mới thì kiểm tra category
    if (category_id) {
      const category = await Category.findByPk(category_id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục",
        });
      }
    }

    // Kiểm tra slug trùng
    if (slug && slug !== product.slug) {
      const existingProduct = await Product.findOne({
        where: { slug },
      });

      if (existingProduct) {
        return res.status(409).json({
          success: false,
          message: "Slug sản phẩm đã tồn tại",
        });
      }
    }

    // Update
    await product.update({
      name,
      slug,
      description,
      price,
      category_id,
      status,
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    console.error("Admin update product error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật sản phẩm",
    });
  }
};

// ===============================
// DELETE PRODUCT - ADMIN
// ===============================
export const deleteProductAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm sản phẩm
    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Xóa sản phẩm
    await product.destroy();

    return res.status(200).json({
      success: true,
      message: "Xóa sản phẩm thành công",
    });
  } catch (error) {
    console.error("Admin delete product error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể xóa sản phẩm",
    });
  }
};
