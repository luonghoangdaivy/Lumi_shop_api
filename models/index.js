import sequelize from "../config/db.js";

import User from "./User.js";
import Category from "./Category.js";
import Product from "./Product.js";
import ProductVariant from "./ProductVariant.js";
import ProductImage from "./ProductImage.js";

const db = {};

db.sequelize = sequelize;

db.User = User;
db.Category = Category;
db.Product = Product;
db.ProductVariant = ProductVariant;
db.ProductImage = ProductImage;

// =========================
// Relationships
// =========================

// Category -> Product
Category.hasMany(Product, {
  foreignKey: "category_id",
  as: "products",
});

Product.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

// Product -> ProductVariant
Product.hasMany(ProductVariant, {
  foreignKey: "product_id",
  as: "variants",
});

ProductVariant.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// Product -> ProductImage
Product.hasMany(ProductImage, {
  foreignKey: "product_id",
  as: "images",
});

ProductImage.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

export default db;
