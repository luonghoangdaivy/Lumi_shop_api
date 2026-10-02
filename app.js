import express from "express";
import cors from "cors";
import db from "./models/index.js";

import authRoutes from "./routes/auth.routes.js";

import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import productVariantRoutes from "./routes/productVariant.routes.js";
import productImageRoutes from "./routes/productImage.routes.js";

import cartRoutes from "./routes/cart.routes.js";
import favoriteRoutes from "./routes/favorite.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import orderRoutes from "./routes/order.routes.js";

// Admin
import adminRoutes from "./routes/admin.routes.js";
import adminDashboardRoutes from "./routes/adminDashboard.routes.js";
import adminOrderRoutes from "./routes/adminOrder.routes.js";
import adminProductRoutes from "./routes/adminProduct.routes.js";
import adminCategoryRoutes from "./routes/adminCategory.routes.js";

const app = express();

const PORT = process.env.PORT || 4000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());

// Static uploads
app.use("/uploads", express.static("uploads"));

// ===============================
// AUTH
// ===============================

app.use("/auth", authRoutes);

// ===============================
// CUSTOMER
// ===============================

app.use("/categories", categoryRoutes);

app.use("/products", productRoutes);
app.use("/products", productVariantRoutes);
app.use("/products", productImageRoutes);

app.use("/cart", cartRoutes);

app.use("/favorites", favoriteRoutes);

app.use("/", reviewRoutes);

app.use("/orders", orderRoutes);

// ===============================
// ADMIN
// ===============================

app.use("/admin", adminRoutes);

app.use("/admin/dashboard", adminDashboardRoutes);

app.use("/admin/orders", adminOrderRoutes);

app.use("/admin/products", adminProductRoutes);

app.use("/admin/categories", adminCategoryRoutes);

// ===============================
// ROOT
// ===============================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Lumi Shop API is running",
  });
});

// ===============================
// START SERVER
// ===============================

const startServer = async () => {
  try {
    await db.sequelize.authenticate();

    console.log("✅ Kết nối PostgreSQL thành công!");

    await db.sequelize.sync({ alter: true });

    console.log("✅ Đồng bộ database thành công!");

    app.listen(PORT, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Không thể kết nối database:", error);
  }
};

startServer();
