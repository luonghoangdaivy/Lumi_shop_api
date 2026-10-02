import db from "../models/index.js";

const { Favorite, Product } = db;

// =========================
// ADD FAVORITE
// =========================

export const addFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    // Kiểm tra sản phẩm
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Kiểm tra đã yêu thích chưa
    const existingFavorite = await Favorite.findOne({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });

    if (existingFavorite) {
      return res.status(409).json({
        success: false,
        message: "Sản phẩm đã có trong danh sách yêu thích",
      });
    }

    // Tạo favorite
    const favorite = await Favorite.create({
      user_id: userId,
      product_id: productId,
    });

    return res.status(201).json({
      success: true,
      message: "Đã thêm sản phẩm vào danh sách yêu thích",
      data: favorite,
    });
  } catch (error) {
    console.error("Add favorite error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể thêm sản phẩm yêu thích",
    });
  }
};

// =========================
// GET FAVORITES
// =========================

export const getFavorites = async (req, res) => {
  try {
    const userId = req.user.id;

    const favorites = await Favorite.findAll({
      where: {
        user_id: userId,
      },
      include: [
        {
          model: Product,
          as: "product",
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: favorites,
    });
  } catch (error) {
    console.error("Get favorites error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách yêu thích",
    });
  }
};

// =========================
// DELETE FAVORITE
// =========================

export const deleteFavorite = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const favorite = await Favorite.findOne({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: "Sản phẩm chưa có trong danh sách yêu thích",
      });
    }

    await favorite.destroy();

    return res.status(200).json({
      success: true,
      message: "Đã xóa sản phẩm khỏi danh sách yêu thích",
    });
  } catch (error) {
    console.error("Delete favorite error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể xóa sản phẩm yêu thích",
    });
  }
};
