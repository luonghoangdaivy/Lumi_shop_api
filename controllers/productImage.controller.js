import db from "../models/index.js";

const { Product, ProductImage } = db;

// GET /products/:productId/images
export const getImagesByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    const images = await ProductImage.findAll({
      where: {
        product_id: productId,
      },
      order: [["id", "ASC"]],
    });

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error("Get images error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách ảnh",
    });
  }
};

// POST /products/:productId/images
export const uploadProductImage = async (req, res) => {
  try {
    const { productId } = req.params;

    // Kiểm tra sản phẩm
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Kiểm tra file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn ảnh",
      });
    }

    // Kiểm tra xem sản phẩm đã có ảnh chưa
    const imageCount = await ProductImage.count({
      where: {
        product_id: productId,
      },
    });

    const image = await ProductImage.create({
      product_id: productId,

      image_url: `/uploads/products/${req.file.filename}`,

      // Ảnh đầu tiên sẽ là ảnh chính
      is_primary: imageCount === 0,
    });

    res.status(201).json({
      success: true,
      message: "Upload ảnh thành công",
      data: image,
    });
  } catch (error) {
    console.error("Upload product image error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể upload ảnh sản phẩm",
    });
  }
};

// DELETE /products/:productId/images/:id
export const deleteProductImage = async (req, res) => {
  try {
    const { productId, id } = req.params;

    const image = await ProductImage.findOne({
      where: {
        id,
        product_id: productId,
      },
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy ảnh",
      });
    }

    await image.destroy();

    res.status(200).json({
      success: true,
      message: "Xóa ảnh thành công",
    });
  } catch (error) {
    console.error("Delete product image error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể xóa ảnh",
    });
  }
};
