import express from "express";

import {
  addFavorite,
  getFavorites,
  deleteFavorite,
} from "../controllers/favorite.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:productId", authMiddleware, addFavorite);

router.get("/", authMiddleware, getFavorites);

router.delete("/:productId", authMiddleware, deleteFavorite);

export default router;
