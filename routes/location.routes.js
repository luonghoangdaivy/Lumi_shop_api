import express from "express";

import {
  getProvinceList,
  getWardList,
} from "../controllers/location.controller.js";

const router = express.Router();

router.get("/provinces", getProvinceList);

router.get("/provinces/:provinceCode/wards", getWardList);

export default router;
