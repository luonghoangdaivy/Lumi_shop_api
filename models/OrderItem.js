import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const OrderItem = sequelize.define(
  "OrderItem",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    variant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    product_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    color: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    size: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },

    subtotal: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
  },
  {
    tableName: "order_items",
    timestamps: true,
    underscored: true,
  },
);

export default OrderItem;
