import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Address = sequelize.define(
  "Address",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    label: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },

    address_line: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },

    province_code: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    province_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    ward_code: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    ward_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    full_address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },

    is_default: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "addresses",
    timestamps: true,
    underscored: true,
  },
);

export default Address;
