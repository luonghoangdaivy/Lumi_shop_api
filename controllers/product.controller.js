import fs from "fs/promises";

import db from "../models/index.js";
import sequelize from "../config/db.js";
import { Op } from "sequelize";

const { Product, Category, ProductVariant, ProductImage } = db;

// Đọc và kiểm tra danh sách biến thể từ JSON/FormData.
const parseVariants = (value) => {
  if (value === undefined || value === null || value === "") {
    return [];
  }

  const variants = typeof value === "string" ? JSON.parse(value) : value;

  if (!Array.isArray(variants)) {
    throw new Error("Dữ liệu variants phải là một mảng");
  }

  for (const variant of variants) {
    if (
      !variant.color ||
      !String(variant.color).trim() ||
      !variant.size ||
      !String(variant.size).trim() ||
      variant.stock === undefined ||
      variant.stock === null ||
      variant.stock === "" ||
      !Number.isInteger(Number(variant.stock)) ||
      Number(variant.stock) < 0
    ) {
      throw new Error("Mỗi biến thể cần có color, size và stock hợp lệ");
    }
  }

  return variants.map((variant) => ({
    color: String(variant.color).trim(),
    size: String(variant.size).trim(),
    stock: Number(variant.stock),
  }));
};

// Đọc JSON an toàn từ FormData.
const parseJsonField = (value, fallback) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  return typeof value === "string" ? JSON.parse(value) : value;
};

// Xóa file vừa upload khi request thất bại.
const removeUploadedFiles = async (files = []) => {
  await Promise.all(
    files.map(async (file) => {
      try {
        await fs.unlink(file.path);
      } catch {
        // Bỏ qua nếu file đã bị xóa hoặc không tồn tại.
      }
    }),
  );
};

// Xóa file ảnh vật lý.
// Chỉ gọi sau khi transaction đã commit thành công.
const removeImageFiles = async (images = []) => {
  await Promise.all(
    images.map(async (image) => {
      try {
        // image_url có dạng /uploads/products/ten-file.jpg
        const filename = image.image_url?.split("/").pop();

        if (!filename) return;

        // Không cho phép filename chứa đường dẫn.
        if (filename !== filename.replace(/[\\/]/g, "")) return;

        const filePath = new URL(
          `../uploads/products/${filename}`,
          import.meta.url,
        );

        await fs.unlink(filePath);
      } catch (error) {
        if (error.code !== "ENOENT") {
          console.error("Không thể xóa file ảnh:", error.message);
        }
      }
    }),
  );
};

// GET /products
export const getProducts = async (req, res) => {
  try {
    const where = {};
    const categoryWhere = {};

    // Lọc sản phẩm nổi bật khi API nhận featured=true
    if (req.query.featured === "true") {
      where.is_featured = true;
    }

    // 1. Lọc theo trạng thái (mặc định ACTIVE nếu được chỉ định hoặc xem danh sách bán hàng)
    if (req.query.status && req.query.status !== "all") {
      where.status = req.query.status;
    }

    // 2. Lọc theo danh mục (ID hoặc Slug)
    if (req.query.category && req.query.category !== "all") {
      const cat = String(req.query.category).trim();
      if (/^\d+$/.test(cat)) {
        where.category_id = Number(cat);
      } else {
        categoryWhere.slug = cat;
      }
    }

    // 3. Tìm kiếm theo tên hoặc mô tả
    if (req.query.search && req.query.search.trim()) {
      const keyword = req.query.search.trim();
      where[Op.or] = [
        { name: { [Op.iLike]: `%${keyword}%` } },
        { description: { [Op.iLike]: `%${keyword}%` } },
      ];
    }

    // 4. Lọc theo khoảng giá
    const minPrice =
      req.query.minPrice !== undefined && req.query.minPrice !== ""
        ? Number(req.query.minPrice)
        : null;
    const maxPrice =
      req.query.maxPrice !== undefined && req.query.maxPrice !== ""
        ? Number(req.query.maxPrice)
        : null;

    if (
      minPrice !== null &&
      !isNaN(minPrice) &&
      maxPrice !== null &&
      !isNaN(maxPrice)
    ) {
      where.price = { [Op.between]: [minPrice, maxPrice] };
    } else if (minPrice !== null && !isNaN(minPrice)) {
      where.price = { [Op.gte]: minPrice };
    } else if (maxPrice !== null && !isNaN(maxPrice)) {
      where.price = { [Op.lte]: maxPrice };
    }

    // 5. Sắp xếp
    let order = [["id", "DESC"]];
    const sort = req.query.sort;
    if (sort === "price_asc") {
      order = [["price", "ASC"]];
    } else if (sort === "price_desc") {
      order = [["price", "DESC"]];
    } else if (sort === "oldest") {
      order = [["id", "ASC"]];
    } else if (sort === "newest") {
      order = [["created_at", "DESC"]];
    }

    // 6. Phân trang
    const hasPagination =
      req.query.page !== undefined || req.query.limit !== undefined;

    if (hasPagination) {
      const page = Math.max(1, parseInt(req.query.page, 10) || 1);
      const limit = Math.max(1, parseInt(req.query.limit, 10) || 12);
      const offset = (page - 1) * limit;

      const { count, rows } = await Product.findAndCountAll({
        where,
        include: [
          {
            model: Category,
            as: "category",
            ...(Object.keys(categoryWhere).length > 0
              ? { where: categoryWhere }
              : {}),
          },
          { model: ProductVariant, as: "variants" },
          { model: ProductImage, as: "images" },
        ],
        distinct: true,
        order,
        limit,
        offset,
      });

      const totalPages = Math.ceil(count / limit) || 1;

      return res.status(200).json({
        success: true,
        data: rows,
        pagination: {
          total: count,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    }

    // Nếu không yêu cầu phân trang -> trả toàn bộ (tương thích ngược)
    const products = await Product.findAll({
      where,
      include: [
        {
          model: Category,
          as: "category",
          ...(Object.keys(categoryWhere).length > 0
            ? { where: categoryWhere }
            : {}),
        },
        { model: ProductVariant, as: "variants" },
        { model: ProductImage, as: "images" },
      ],
      distinct: true,
      order,
    });

    return res.status(200).json({
      success: true,
      data: products,
      total: products.length,
    });
  } catch (error) {
    console.error("Get products error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách sản phẩm",
    });
  }
};

// GET /products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, as: "category" },
        { model: ProductVariant, as: "variants" },
        { model: ProductImage, as: "images" },
      ],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy sản phẩm",
    });
  }
};

// POST /products
export const createProduct = async (req, res) => {
  const uploadedFiles = req.files || [];
  let transaction;

  try {
    const { category_id, name, slug, description, price, status, is_featured } =
      req.body;

    if (
      !category_id ||
      !name?.trim() ||
      !slug?.trim() ||
      price === undefined ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      await removeUploadedFiles(uploadedFiles);

      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập đầy đủ tên, slug, danh mục và giá hợp lệ.",
      });
    }

    if (!ProductImage) {
      throw new Error(
        "Không tìm thấy model ProductImage trong models/index.js",
      );
    }

    const category = await Category.findByPk(category_id);

    if (!category) {
      await removeUploadedFiles(uploadedFiles);

      return res.status(400).json({
        success: false,
        message: "Danh mục không tồn tại.",
      });
    }

    const normalizedSlug = slug.trim();

    const existingProduct = await Product.findOne({
      where: { slug: normalizedSlug },
    });

    if (existingProduct) {
      await removeUploadedFiles(uploadedFiles);

      return res.status(409).json({
        success: false,
        message: "Slug sản phẩm đã tồn tại.",
      });
    }

    const variants = parseVariants(req.body.variants);
    const primaryIndex = Number(req.body.primaryImageIndex ?? 0);

    if (
      uploadedFiles.length > 0 &&
      (!Number.isInteger(primaryIndex) ||
        primaryIndex < 0 ||
        primaryIndex >= uploadedFiles.length)
    ) {
      await removeUploadedFiles(uploadedFiles);

      return res.status(400).json({
        success: false,
        message: "Chỉ số ảnh chính không hợp lệ.",
      });
    }

    transaction = await sequelize.transaction();

    const product = await Product.create(
      {
        category_id: Number(category_id),
        name: name.trim(),
        slug: normalizedSlug,
        description: description?.trim() || null,
        price: Number(price),
        status: status || "ACTIVE",
        is_featured: is_featured === true || is_featured === "true",
      },
      { transaction },
    );

    if (uploadedFiles.length > 0) {
      await ProductImage.bulkCreate(
        uploadedFiles.map((file, index) => ({
          product_id: product.id,
          image_url: `/uploads/products/${file.filename}`,
          is_primary: index === primaryIndex,
        })),
        { transaction, validate: true },
      );
    }

    if (variants.length > 0) {
      await ProductVariant.bulkCreate(
        variants.map((variant) => ({
          product_id: product.id,
          ...variant,
        })),
        { transaction, validate: true },
      );
    }

    await transaction.commit();
    transaction = null;

    const createdProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: "category" },
        { model: ProductVariant, as: "variants" },
        { model: ProductImage, as: "images" },
      ],
    });

    return res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công.",
      data: createdProduct,
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("Transaction rollback error:", rollbackError);
      }
    }

    await removeUploadedFiles(uploadedFiles);
    console.error("Create product error:", error);

    return res
      .status(
        error.name === "SequelizeValidationError" ||
          error.name === "SequelizeForeignKeyConstraintError"
          ? 400
          : 500,
      )
      .json({
        success: false,
        message: error.message || "Không thể tạo sản phẩm.",
      });
  }
};

// PUT /products/:id
export const updateProduct = async (req, res) => {
  const uploadedFiles = req.files || [];
  let transaction;
  let imagesToDeleteAfterCommit = [];

  try {
    const { id } = req.params;
    const { category_id, name, slug, description, price, status, is_featured } =
      req.body;

    const product = await Product.findByPk(id);

    if (!product) {
      await removeUploadedFiles(uploadedFiles);

      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    if (category_id !== undefined) {
      const category = await Category.findByPk(category_id);

      if (!category) {
        await removeUploadedFiles(uploadedFiles);

        return res.status(400).json({
          success: false,
          message: "Danh mục không tồn tại",
        });
      }
    }

    const normalizedSlug =
      slug !== undefined && slug.trim() ? slug.trim() : product.slug;

    if (normalizedSlug !== product.slug) {
      const existingProduct = await Product.findOne({
        where: { slug: normalizedSlug },
      });

      if (existingProduct && Number(existingProduct.id) !== Number(id)) {
        await removeUploadedFiles(uploadedFiles);

        return res.status(409).json({
          success: false,
          message: "Slug sản phẩm đã tồn tại",
        });
      }
    }

    if (
      price !== undefined &&
      (price === "" || !Number.isFinite(Number(price)) || Number(price) < 0)
    ) {
      await removeUploadedFiles(uploadedFiles);

      return res.status(400).json({
        success: false,
        message: "Giá sản phẩm không hợp lệ",
      });
    }

    const variantsProvided = req.body.variants !== undefined;
    const variants = parseVariants(req.body.variants);

    const keepImageIds = parseJsonField(req.body.keepImageIds, null);

    if (
      keepImageIds !== null &&
      (!Array.isArray(keepImageIds) ||
        keepImageIds.some((imageId) => !Number.isInteger(Number(imageId))))
    ) {
      await removeUploadedFiles(uploadedFiles);

      return res.status(400).json({
        success: false,
        message: "Danh sách ảnh cần giữ không hợp lệ.",
      });
    }

    const primaryImageId = req.body.primaryImageId
      ? Number(req.body.primaryImageId)
      : null;

    const primaryIndex = Number(req.body.primaryImageIndex ?? -1);

    if (
      uploadedFiles.length > 0 &&
      primaryIndex !== -1 &&
      (!Number.isInteger(primaryIndex) ||
        primaryIndex < 0 ||
        primaryIndex >= uploadedFiles.length)
    ) {
      await removeUploadedFiles(uploadedFiles);

      return res.status(400).json({
        success: false,
        message: "Chỉ số ảnh chính không hợp lệ.",
      });
    }

    transaction = await sequelize.transaction();

    await product.update(
      {
        category_id: category_id ?? product.category_id,
        name: name?.trim() || product.name,
        slug: normalizedSlug,
        description:
          description !== undefined
            ? description.trim() || null
            : product.description,
        price: price !== undefined ? Number(price) : product.price,
        status: status ?? product.status,
        is_featured:
          is_featured !== undefined
            ? is_featured === true || is_featured === "true"
            : product.is_featured,
      },
      { transaction },
    );

    // Thay toàn bộ danh sách biến thể nếu request gửi variants.
    if (variantsProvided) {
      await ProductVariant.destroy({
        where: { product_id: product.id },
        transaction,
      });

      if (variants.length > 0) {
        await ProductVariant.bulkCreate(
          variants.map((variant) => ({
            product_id: product.id,
            ...variant,
          })),
          { transaction, validate: true },
        );
      }
    }

    // Lấy ảnh hiện tại của sản phẩm trong transaction.
    const oldImages = await ProductImage.findAll({
      where: { product_id: product.id },
      transaction,
    });

    // Nếu frontend gửi keepImageIds, chỉ giữ lại các ảnh được chỉ định.
    // Không gửi trường này nghĩa là giữ nguyên toàn bộ ảnh cũ.
    if (Array.isArray(keepImageIds)) {
      const keepIds = new Set(keepImageIds.map(Number));

      const invalidIds = [...keepIds].filter(
        (imageId) => !oldImages.some((image) => Number(image.id) === imageId),
      );

      if (invalidIds.length > 0) {
        throw new Error("Danh sách ảnh chứa ảnh không thuộc sản phẩm.");
      }

      imagesToDeleteAfterCommit = oldImages.filter(
        (image) => !keepIds.has(Number(image.id)),
      );

      for (const image of imagesToDeleteAfterCommit) {
        await image.destroy({ transaction });
      }
    }

    // Thêm ảnh mới vào database.
    const newImages = [];

    for (let index = 0; index < uploadedFiles.length; index++) {
      const file = uploadedFiles[index];

      const image = await ProductImage.create(
        {
          product_id: product.id,
          image_url: `/uploads/products/${file.filename}`,
          is_primary: false,
        },
        { transaction },
      );

      newImages.push(image);
    }

    // Chọn ảnh chính. Nếu chọn ảnh mới, dùng primaryImageIndex;
    // nếu không, dùng primaryImageId hoặc ảnh còn lại đầu tiên.
    let selectedPrimaryImage = null;

    if (
      uploadedFiles.length > 0 &&
      primaryIndex >= 0 &&
      primaryIndex < newImages.length
    ) {
      selectedPrimaryImage = newImages[primaryIndex];
    } else {
      const remainingOldImages = oldImages.filter(
        (image) =>
          !imagesToDeleteAfterCommit.some(
            (removed) => Number(removed.id) === Number(image.id),
          ),
      );

      selectedPrimaryImage =
        remainingOldImages.find(
          (image) => Number(image.id) === primaryImageId,
        ) ||
        remainingOldImages.find((image) => image.is_primary) ||
        remainingOldImages[0] ||
        newImages[0] ||
        null;
    }

    // Bảo đảm tối đa một ảnh chính cho sản phẩm.
    await ProductImage.update(
      { is_primary: false },
      {
        where: { product_id: product.id },
        transaction,
      },
    );

    if (selectedPrimaryImage) {
      await selectedPrimaryImage.update({ is_primary: true }, { transaction });
    }

    // Không cho phép lưu sản phẩm có 0 ảnh nếu trước đó có ảnh
    // hoặc người dùng đang sử dụng chức năng quản lý ảnh.
    const finalImageCount =
      oldImages.length - imagesToDeleteAfterCommit.length + newImages.length;

    if (finalImageCount === 0) {
      throw new Error("Sản phẩm phải có ít nhất một ảnh.");
    }

    await transaction.commit();
    transaction = null;

    // Chỉ xóa file vật lý sau khi database commit thành công.
    await removeImageFiles(imagesToDeleteAfterCommit);

    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: "category" },
        { model: ProductVariant, as: "variants" },
        { model: ProductImage, as: "images" },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: updatedProduct,
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error("Transaction rollback error:", rollbackError);
      }
    }

    await removeUploadedFiles(uploadedFiles);

    console.error("Update product error:", error);

    return res
      .status(
        error.name === "SequelizeValidationError" ||
          error.name === "SequelizeForeignKeyConstraintError"
          ? 400
          : 500,
      )
      .json({
        success: false,
        message: error.message || "Không thể cập nhật sản phẩm",
      });
  }
};

// DELETE /products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: ProductImage, as: "images" }],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    const images = product.images || [];

    await product.destroy();

    // Xóa file ảnh vật lý sau khi xóa sản phẩm thành công.
    await removeImageFiles(images);

    return res.status(200).json({
      success: true,
      message: "Xóa sản phẩm thành công",
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể xóa sản phẩm",
    });
  }
};
