import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./models/index.js";

import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";

const app = express();

const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/products", productRoutes);
app.use("/categories", categoryRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Lumi Shop API đang chạy",
  });
});

// Kết nối database và khởi động server
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
