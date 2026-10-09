import { getProvinces, getWards } from "../services/vietnamLocation.service.js";

export const getProvinceList = async (req, res) => {
  try {
    const provinces = await getProvinces();

    return res.status(200).json({
      success: true,
      data: provinces,
    });
  } catch (error) {
    console.error("GET PROVINCES ERROR:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Không thể tải danh sách tỉnh/thành",
    });
  }
};

export const getWardList = async (req, res) => {
  try {
    const { provinceCode } = req.params;

    const wards = await getWards(provinceCode);

    return res.status(200).json({
      success: true,
      data: wards,
    });
  } catch (error) {
    console.error("GET WARDS ERROR:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Không thể tải danh sách phường/xã",
    });
  }
};
