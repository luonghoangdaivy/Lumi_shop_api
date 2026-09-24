import express from "express";

import {
  getVariantsByProduct,
  getVariantById,
  createVariant,
  updateVariant,
  deleteVariant,
} from "../controllers/productVariant.controller.js";

const router = express.Router();

router.get("/:productId/variants", getVariantsByProduct);

router.get("/:productId/variants/:id", getVariantById);

router.post("/:productId/variants", createVariant);

router.put("/:productId/variants/:id", updateVariant);

router.delete("/:productId/variants/:id", deleteVariant);

export default router;
