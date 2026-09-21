import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const ProductVariant = sequelize.define(
  "ProductVariant",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    color: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    size: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
  },
  {
    tableName: "product_variants",
    timestamps: true,
    underscored: true,
  },
);

export default ProductVariant;
