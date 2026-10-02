import sequelize from "../config/db.js";

// =========================
// Import Models
// =========================

import User from "./User.js";
import Category from "./Category.js";
import Product from "./Product.js";
import ProductVariant from "./ProductVariant.js";
import ProductImage from "./ProductImage.js";

import Cart from "./Cart.js";
import CartItem from "./CartItem.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";

import Favorite from "./Favorite.js";
import Review from "./Review.js";

// =========================
// Database Object
// =========================

const db = {};

db.sequelize = sequelize;

// =========================
// Register Models
// =========================

db.User = User;
db.Category = Category;
db.Product = Product;
db.ProductVariant = ProductVariant;
db.ProductImage = ProductImage;

db.Cart = Cart;
db.CartItem = CartItem;
db.Order = Order;
db.OrderItem = OrderItem;

db.Favorite = Favorite;
db.Review = Review;

// =========================
// Relationships
// =========================

// ---------------------------------
// Category -> Product
// ---------------------------------

Category.hasMany(Product, {
  foreignKey: "category_id",
  as: "products",
});

Product.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

// ---------------------------------
// Product -> ProductVariant
// ---------------------------------

Product.hasMany(ProductVariant, {
  foreignKey: "product_id",
  as: "variants",
});

ProductVariant.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// ---------------------------------
// Product -> ProductImage
// ---------------------------------

Product.hasMany(ProductImage, {
  foreignKey: "product_id",
  as: "images",
});

ProductImage.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// ---------------------------------
// User -> Cart
// ---------------------------------

User.hasOne(Cart, {
  foreignKey: "user_id",
  as: "cart",
});

Cart.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// ---------------------------------
// Cart -> CartItem
// ---------------------------------

Cart.hasMany(CartItem, {
  foreignKey: "cart_id",
  as: "items",
});

CartItem.belongsTo(Cart, {
  foreignKey: "cart_id",
  as: "cart",
});

// ---------------------------------
// ProductVariant -> CartItem
// ---------------------------------

ProductVariant.hasMany(CartItem, {
  foreignKey: "variant_id",
  as: "cartItems",
});

CartItem.belongsTo(ProductVariant, {
  foreignKey: "variant_id",
  as: "variant",
});

// ---------------------------------
// User -> Favorite
// ---------------------------------

User.hasMany(Favorite, {
  foreignKey: "user_id",
  as: "favorites",
});

Favorite.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// ---------------------------------
// Product -> Favorite
// ---------------------------------

Product.hasMany(Favorite, {
  foreignKey: "product_id",
  as: "favorites",
});

Favorite.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// ---------------------------------
// User -> Review
// ---------------------------------

User.hasMany(Review, {
  foreignKey: "user_id",
  as: "reviews",
});

Review.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// ---------------------------------
// Product -> Review
// ---------------------------------

Product.hasMany(Review, {
  foreignKey: "product_id",
  as: "reviews",
});

Review.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

// =========================
// User -> Order
// =========================

User.hasMany(Order, {
  foreignKey: "user_id",
  as: "orders",
});

Order.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// =========================
// Order -> OrderItem
// =========================

Order.hasMany(OrderItem, {
  foreignKey: "order_id",
  as: "items",
});

OrderItem.belongsTo(Order, {
  foreignKey: "order_id",
  as: "order",
});

// =========================
// ProductVariant -> OrderItem
// =========================

ProductVariant.hasMany(OrderItem, {
  foreignKey: "variant_id",
  as: "orderItems",
});

OrderItem.belongsTo(ProductVariant, {
  foreignKey: "variant_id",
  as: "variant",
});

// =========================
// Export
// =========================

export default db;
