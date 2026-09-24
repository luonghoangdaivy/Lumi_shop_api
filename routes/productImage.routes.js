import express from "express";

import upload from "../middleware/upload.js";

import {
  getImagesByProduct,
  uploadProductImage,
  deleteProductImage,
} from "../controllers/productImage.controller.js";

const router = express.Router();

router.get("/:productId/images", getImagesByProduct);

router.post("/:productId/images", upload.single("image"), uploadProductImage);

router.delete("/:productId/images/:id", deleteProductImage);

export default router;
