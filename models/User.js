import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    username: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    reset_password_token: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },

    reset_password_expires: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },

    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    role: {
      type: DataTypes.ENUM("USER", "CUSTOMER", "ADMIN"),
      allowNull: false,
      defaultValue: "USER",
    },
  },
  {
    tableName: "users",
    timestamps: true,
    underscored: true,
  },
);

export default User;
