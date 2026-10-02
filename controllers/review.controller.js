import db from "../models/index.js";

const { Review, Product, User } = db;

// =========================
// CREATE REVIEW
// =========================

export const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { rating, comment } = req.body;

    // Kiểm tra rating
    if (rating === undefined || rating === null) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập số sao",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Số sao phải từ 1 đến 5",
      });
    }

    // Kiểm tra sản phẩm
    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Kiểm tra user đã đánh giá sản phẩm chưa
    const existingReview = await Review.findOne({
      where: {
        user_id: userId,
        product_id: productId,
      },
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "Bạn đã đánh giá sản phẩm này",
      });
    }

    // Tạo review
    const review = await Review.create({
      user_id: userId,
      product_id: productId,
      rating,
      comment,
    });

    return res.status(201).json({
      success: true,
      message: "Đánh giá sản phẩm thành công",
      data: review,
    });
  } catch (error) {
    console.error("Create review error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể tạo đánh giá",
    });
  }
};

// =========================
// GET REVIEWS BY PRODUCT
// =========================

export const getReviewsByProduct = async (req, res) => {
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

    // Lấy danh sách review
    const reviews = await Review.findAll({
      where: {
        product_id: productId,
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách đánh giá",
    });
  }
};

// =========================
// UPDATE REVIEW
// =========================

export const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { rating, comment } = req.body;

    // Tìm review của chính user
    const review = await Review.findOne({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá",
      });
    }

    // Kiểm tra rating nếu có cập nhật
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Số sao phải từ 1 đến 5",
        });
      }

      review.rating = rating;
    }

    // Cập nhật comment nếu có
    if (comment !== undefined) {
      review.comment = comment;
    }

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật đánh giá thành công",
      data: review,
    });
  } catch (error) {
    console.error("Update review error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật đánh giá",
    });
  }
};

// =========================
// DELETE REVIEW
// =========================

export const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Chỉ user tạo review mới được xóa
    const review = await Review.findOne({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá",
      });
    }

    await review.destroy();

    return res.status(200).json({
      success: true,
      message: "Xóa đánh giá thành công",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể xóa đánh giá",
    });
  }
};
