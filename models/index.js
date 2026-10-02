import sequelize from "../config/db.js";

import User from "./User.js";
import Category from "./Category.js";
import Product from "./Product.js";
import ProductVariant from "./ProductVariant.js";
import ProductImage from "./ProductImage.js";

import Cart from "./Cart.js";
import CartItem from "./CartItem.js";

import Favorite from "./Favorite.js";

const db = {};

db.sequelize = sequelize;

db.User = User;
db.Category = Category;
db.Product = Product;
db.ProductVariant = ProductVariant;
db.ProductImage = ProductImage;
db.Cart = Cart;
db.CartItem = CartItem;
db.Favorite = Favorite;

// =========================
// Relationships
// =========================

// =========================
// User -> Favorite
// =========================

User.hasMany(Favorite, {
  foreignKey: "user_id",
  as: "favorites",
});

Favorite.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// =========================
// Product -> Favorite
// =========================

Product.hasMany(Favorite, {
  foreignKey: "product_id",
  as: "favorites",
});

Favorite.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// =========================
// Category -> Product
// =========================

Category.hasMany(Product, {
  foreignKey: "category_id",
  as: "products",
});

Product.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

// =========================
// Product -> ProductVariant
// =========================

Product.hasMany(ProductVariant, {
  foreignKey: "product_id",
  as: "variants",
});

ProductVariant.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// =========================
// Product -> ProductImage
// =========================

Product.hasMany(ProductImage, {
  foreignKey: "product_id",
  as: "images",
});

ProductImage.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// =========================
// User -> Cart
// =========================

User.hasOne(Cart, {
  foreignKey: "user_id",
  as: "cart",
});

Cart.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// =========================
// Cart -> CartItem
// =========================

Cart.hasMany(CartItem, {
  foreignKey: "cart_id",
  as: "items",
});

CartItem.belongsTo(Cart, {
  foreignKey: "cart_id",
  as: "cart",
});

// =========================
// ProductVariant -> CartItem
// =========================

ProductVariant.hasMany(CartItem, {
  foreignKey: "variant_id",
  as: "cartItems",
});

CartItem.belongsTo(ProductVariant, {
  foreignKey: "variant_id",
  as: "variant",
});

export default db;
