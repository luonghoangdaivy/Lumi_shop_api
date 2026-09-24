import db from "../models/index.js";

const { Product, Category, ProductVariant, ProductImage } = db;

// GET /products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: Category,
          as: "category",
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
      order: [["id", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách sản phẩm",
    });
  }
};

// GET /products/:id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: "category",
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
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể lấy sản phẩm",
    });
  }
};

// POST /products
export const createProduct = async (req, res) => {
  try {
    const { category_id, name, slug, description, price, status } = req.body;

    // Kiểm tra dữ liệu bắt buộc
    if (!category_id || !name || !slug || price === undefined) {
      return res.status(400).json({
        success: false,
        message: "category_id, name, slug và price là bắt buộc",
      });
    }

    // Kiểm tra category tồn tại
    const category = await Category.findByPk(category_id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Danh mục không tồn tại",
      });
    }

    // Kiểm tra slug
    const existingProduct = await Product.findOne({
      where: { slug },
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: "Slug sản phẩm đã tồn tại",
      });
    }

    const product = await Product.create({
      category_id,
      name,
      slug,
      description,
      price,
      status: status || "ACTIVE",
    });

    res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    console.error("Create product error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể tạo sản phẩm",
    });
  }
};

// PUT /products/:id
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { category_id, name, slug, description, price, status } = req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Nếu đổi category
    if (category_id && category_id !== product.category_id) {
      const category = await Category.findByPk(category_id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Danh mục không tồn tại",
        });
      }
    }

    // Nếu đổi slug
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

    await product.update({
      category_id: category_id ?? product.category_id,
      name: name ?? product.name,
      slug: slug ?? product.slug,
      description: description ?? product.description,
      price: price ?? product.price,
      status: status ?? product.status,
    });

    res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: product,
    });
  } catch (error) {
    console.error("Update product error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể cập nhật sản phẩm",
    });
  }
};

// DELETE /products/:id
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    await product.destroy();

    res.status(200).json({
      success: true,
      message: "Xóa sản phẩm thành công",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể xóa sản phẩm",
    });
  }
};
