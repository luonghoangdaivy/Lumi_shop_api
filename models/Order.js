import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Order = sequelize.define(
  "Order",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    order_code: {
      type: DataTypes.STRING(12),
      allowNull: true,
      unique: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
    },

    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "CONFIRMED",
        "SHIPPING",
        "DELIVERED",
        "CANCELLED",
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },

    payment_method: {
      type: DataTypes.ENUM("COD", "ONLINE"),
      allowNull: false,
    },

    payment_status: {
      type: DataTypes.ENUM("PENDING", "PAID", "FAILED"),
      allowNull: false,
      defaultValue: "PENDING",
    },

    shipping_address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    shipping_phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
  },
  {
    tableName: "orders",
    timestamps: true,
    underscored: true,
  },
);

export default Order;
