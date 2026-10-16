import db from "../models/index.js";

const { Review, User, Product } = db;

// ==========================================
// 1. Lấy tất cả đánh giá - Admin
// ==========================================
export const getAllReviews = async (req, res) => {
  try {
    const { search = "", rating = "" } = req.query;

    const where = {};

    if (["1", "2", "3", "4", "5"].includes(String(rating))) {
      where.rating = Number(rating);
    }

    const reviews = await Review.findAll({
      where,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"],
        },
        {
          model: Product,
          as: "product",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const keyword = String(search).trim().toLowerCase();

    const filteredReviews = keyword
      ? reviews.filter((review) => {
          const userName = review.user?.name?.toLowerCase() || "";
          const userEmail = review.user?.email?.toLowerCase() || "";
          const productName = review.product?.name?.toLowerCase() || "";
          const comment = review.comment?.toLowerCase() || "";

          return (
            userName.includes(keyword) ||
            userEmail.includes(keyword) ||
            productName.includes(keyword) ||
            comment.includes(keyword)
          );
        })
      : reviews;

    return res.status(200).json({
      success: true,
      data: filteredReviews,
      total: filteredReviews.length,
    });
  } catch (error) {
    console.error("GET ALL REVIEWS ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể tải danh sách đánh giá.",
    });
  }
};

// ==========================================
// 2. Lấy đánh giá theo sản phẩm
// ==========================================
export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.findAll({
      where: { product_id: productId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      data: reviews,
    });
  } catch (error) {
    console.error("GET REVIEWS BY PRODUCT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể tải đánh giá sản phẩm.",
    });
  }
};

// ==========================================
// 3. Tạo đánh giá
// ==========================================
export const createReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Không xác định được người dùng đăng nhập.",
      });
    }

    const ratingNumber = Number(rating);

    if (
      !Number.isInteger(ratingNumber) ||
      ratingNumber < 1 ||
      ratingNumber > 5
    ) {
      return res.status(400).json({
        success: false,
        message: "Số sao phải là số nguyên từ 1 đến 5.",
      });
    }

    const product = await Product.findByPk(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm.",
      });
    }

    const review = await Review.create({
      user_id: userId,
      product_id: productId,
      rating: ratingNumber,
      comment: comment?.trim() || null,
    });

    return res.status(201).json({
      success: true,
      message: "Đánh giá sản phẩm thành công.",
      data: review,
    });
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể tạo đánh giá.",
    });
  }
};

// ==========================================
// 4. Sửa đánh giá - chủ đánh giá hoặc Admin
// ==========================================
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?.id || req.user?.userId;
    const role = req.user?.role;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá.",
      });
    }

    if (String(review.user_id) !== String(userId) && role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền sửa đánh giá này.",
      });
    }

    if (rating !== undefined) {
      const ratingNumber = Number(rating);

      if (
        !Number.isInteger(ratingNumber) ||
        ratingNumber < 1 ||
        ratingNumber > 5
      ) {
        return res.status(400).json({
          success: false,
          message: "Số sao phải là số nguyên từ 1 đến 5.",
        });
      }

      review.rating = ratingNumber;
    }

    if (comment !== undefined) {
      review.comment = comment?.trim() || null;
    }

    await review.save();

    return res.status(200).json({
      success: true,
      message: "Cập nhật đánh giá thành công.",
      data: review,
    });
  } catch (error) {
    console.error("UPDATE REVIEW ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật đánh giá.",
    });
  }
};

// ==========================================
// 5. Xóa đánh giá - chủ đánh giá hoặc Admin
// ==========================================
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?.userId;
    const role = req.user?.role;

    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đánh giá.",
      });
    }

    if (String(review.user_id) !== String(userId) && role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xóa đánh giá này.",
      });
    }

    await review.destroy();

    return res.status(200).json({
      success: true,
      message: "Xóa đánh giá thành công.",
    });
  } catch (error) {
    console.error("DELETE REVIEW ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Không thể xóa đánh giá.",
    });
  }
};
