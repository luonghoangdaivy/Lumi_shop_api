import db from "../models/index.js";

const { Category } = db;

// GET /categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      order: [["id", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách danh mục",
    });
  }
};

// GET /categories/:id
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get category error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể lấy danh mục",
    });
  }
};

// POST /categories
export const createCategory = async (req, res) => {
  try {
    const { name, slug } = req.body;

    // Kiểm tra dữ liệu
    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: "Tên và slug là bắt buộc",
      });
    }

    // Kiểm tra slug đã tồn tại chưa
    const existingCategory = await Category.findOne({
      where: { slug },
    });

    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: "Slug danh mục đã tồn tại",
      });
    }

    const category = await Category.create({
      name,
      slug,
    });

    res.status(201).json({
      success: true,
      message: "Tạo danh mục thành công",
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể tạo danh mục",
    });
  }
};

// PUT /categories/:id
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    // Nếu đổi slug thì kiểm tra slug mới
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

    await category.update({
      name: name ?? category.name,
      slug: slug ?? category.slug,
    });

    res.status(200).json({
      success: true,
      message: "Cập nhật danh mục thành công",
      data: category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể cập nhật danh mục",
    });
  }
};

// DELETE /categories/:id
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    await category.destroy();

    res.status(200).json({
      success: true,
      message: "Xóa danh mục thành công",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể xóa danh mục",
    });
  }
};
