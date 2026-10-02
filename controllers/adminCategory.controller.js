import db from "../models/index.js";

const { Category, Product } = db;

// ======================================
// GET ALL CATEGORIES - ADMIN
// ======================================
export const getAllCategoriesAdmin = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [
        {
          model: Product,
          as: "products",
          attributes: ["id", "name", "slug", "price", "status"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Admin get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách danh mục",
    });
  }
};

// ======================================
// CREATE CATEGORY - ADMIN
// ======================================
export const createCategoryAdmin = async (req, res) => {
  try {
    const { name, slug } = req.body;

    // Kiểm tra dữ liệu
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tên và slug danh mục",
      });
    }

    // Kiểm tra slug đã tồn tại
    const existingCategory = await Category.findOne({
      where: { slug },
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Slug danh mục đã tồn tại",
      });
    }

    // Tạo category
    const category = await Category.create({
      name,
      slug,
    });

    return res.status(201).json({
      success: true,
      message: "Tạo danh mục thành công",
      data: category,
    });
  } catch (error) {
    console.error("Admin create category error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể tạo danh mục",
    });
  }
};

// ======================================
// UPDATE CATEGORY - ADMIN
// ======================================
export const updateCategoryAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    // Tìm category
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    // Kiểm tra slug trùng
    if (slug && slug !== category.slug) {
      const existingCategory = await Category.findOne({
        where: { slug },
      });

      if (existingCategory) {
        return res.status(409).json({
          success: false,
          message: "Slug danh mục đã tồn tại",
        });
      }
    }

    // Cập nhật
    await category.update({
      name,
      slug,
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật danh mục thành công",
      data: category,
    });
  } catch (error) {
    console.error("Admin update category error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật danh mục",
    });
  }
};

// ======================================
// DELETE CATEGORY - ADMIN
// ======================================
export const deleteCategoryAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Tìm category
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    // Kiểm tra category có sản phẩm hay chưa
    const productCount = await Product.count({
      where: {
        category_id: id,
      },
    });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Không thể xóa danh mục vì đang có sản phẩm thuộc danh mục này",
      });
    }

    // Xóa category
    await category.destroy();

    return res.status(200).json({
      success: true,
      message: "Xóa danh mục thành công",
    });
  } catch (error) {
    console.error("Admin delete category error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể xóa danh mục",
    });
  }
};
