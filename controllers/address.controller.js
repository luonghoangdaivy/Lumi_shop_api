import db from "../models/index.js";

const { Address } = db;

// ========================================
// GET ALL ADDRESSES
// ========================================

export const getAddresses = async (req, res) => {
  try {
    const userId = req.user.id;

    const addresses = await Address.findAll({
      where: {
        user_id: userId,
      },
      order: [
        ["is_default", "DESC"],
        ["created_at", "DESC"],
      ],
    });

    return res.status(200).json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error("GET ADDRESSES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách địa chỉ",
      error: error.message,
    });
  }
};

// ========================================
// GET ADDRESS BY ID
// ========================================

export const getAddressById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const address = await Address.findOne({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa chỉ",
      });
    }

    return res.status(200).json({
      success: true,
      data: address,
    });
  } catch (error) {
    console.error("GET ADDRESS BY ID ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể lấy địa chỉ",
      error: error.message,
    });
  }
};

// ========================================
// CREATE ADDRESS
// ========================================

export const createAddress = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      label,
      full_name,
      phone,
      address_line,
      province_code,
      province_name,
      ward_code,
      ward_name,
      full_address,
      is_default,
    } = req.body;

    // -------------------------
    // Validate
    // -------------------------

    if (!full_name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập họ và tên",
      });
    }

    if (!phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập số điện thoại",
      });
    }

    if (!/^0\d{9}$/.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "Số điện thoại phải gồm 10 số và bắt đầu bằng 0",
      });
    }

    if (!address_line?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập địa chỉ chi tiết",
      });
    }

    if (!province_code || !province_name) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn tỉnh/thành phố",
      });
    }

    if (!ward_code || !ward_name) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn phường/xã",
      });
    }

    if (!full_address?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Địa chỉ đầy đủ không được để trống",
      });
    }

    // -------------------------
    // Kiểm tra địa chỉ đầu tiên
    // -------------------------

    const addressCount = await Address.count({
      where: {
        user_id: userId,
      },
    });

    let isDefault = Boolean(is_default);

    // Địa chỉ đầu tiên luôn mặc định
    if (addressCount === 0) {
      isDefault = true;
    }

    // -------------------------
    // Nếu là mặc định
    // => bỏ default cũ
    // -------------------------

    if (isDefault) {
      await Address.update(
        {
          is_default: false,
        },
        {
          where: {
            user_id: userId,
          },
        },
      );
    }

    // -------------------------
    // Create
    // -------------------------

    const address = await Address.create({
      user_id: userId,
      label: label?.trim() || null,
      full_name: full_name.trim(),
      phone: phone.trim(),
      address_line: address_line.trim(),
      province_code: Number(province_code),
      province_name: province_name.trim(),
      ward_code: Number(ward_code),
      ward_name: ward_name.trim(),
      full_address: full_address.trim(),
      is_default: isDefault,
    });

    return res.status(201).json({
      success: true,
      message: "Thêm địa chỉ thành công",
      data: address,
    });
  } catch (error) {
    console.error("CREATE ADDRESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể thêm địa chỉ",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE ADDRESS
// ========================================

export const updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const {
      label,
      full_name,
      phone,
      address_line,
      province_code,
      province_name,
      ward_code,
      ward_name,
      full_address,
      is_default,
    } = req.body;

    const address = await Address.findOne({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa chỉ",
      });
    }

    // -------------------------
    // Validate
    // -------------------------

    if (!full_name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập họ và tên",
      });
    }

    if (!phone?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập số điện thoại",
      });
    }

    if (!/^0\d{9}$/.test(phone.trim())) {
      return res.status(400).json({
        success: false,
        message: "Số điện thoại phải gồm 10 số và bắt đầu bằng 0",
      });
    }

    if (!address_line?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập địa chỉ chi tiết",
      });
    }

    if (!province_code || !province_name) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn tỉnh/thành phố",
      });
    }

    if (!ward_code || !ward_name) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn phường/xã",
      });
    }

    if (!full_address?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Địa chỉ đầy đủ không được để trống",
      });
    }

    // -------------------------
    // Default
    // -------------------------

    const shouldBeDefault = Boolean(is_default);

    if (shouldBeDefault) {
      await Address.update(
        {
          is_default: false,
        },
        {
          where: {
            user_id: userId,
          },
        },
      );
    }

    await address.update({
      label: label?.trim() || null,
      full_name: full_name.trim(),
      phone: phone.trim(),
      address_line: address_line.trim(),
      province_code: Number(province_code),
      province_name: province_name.trim(),
      ward_code: Number(ward_code),
      ward_name: ward_name.trim(),
      full_address: full_address.trim(),
      is_default: shouldBeDefault,
    });

    return res.status(200).json({
      success: true,
      message: "Cập nhật địa chỉ thành công",
      data: address,
    });
  } catch (error) {
    console.error("UPDATE ADDRESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể cập nhật địa chỉ",
      error: error.message,
    });
  }
};

// ========================================
// SET DEFAULT ADDRESS
// ========================================

export const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const address = await Address.findOne({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa chỉ",
      });
    }

    // Bỏ default tất cả địa chỉ của user
    await Address.update(
      {
        is_default: false,
      },
      {
        where: {
          user_id: userId,
        },
      },
    );

    // Đặt địa chỉ được chọn làm default
    await address.update({
      is_default: true,
    });

    return res.status(200).json({
      success: true,
      message: "Đã đặt địa chỉ mặc định",
      data: address,
    });
  } catch (error) {
    console.error("SET DEFAULT ADDRESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể đặt địa chỉ mặc định",
      error: error.message,
    });
  }
};

// ========================================
// DELETE ADDRESS
// ========================================

export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const address = await Address.findOne({
      where: {
        id,
        user_id: userId,
      },
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy địa chỉ",
      });
    }

    const wasDefault = address.is_default;

    await address.destroy();

    // Nếu xóa địa chỉ mặc định
    // => chọn địa chỉ khác làm mặc định
    if (wasDefault) {
      const nextAddress = await Address.findOne({
        where: {
          user_id: userId,
        },
        order: [["created_at", "ASC"]],
      });

      if (nextAddress) {
        await nextAddress.update({
          is_default: true,
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: "Xóa địa chỉ thành công",
    });
  } catch (error) {
    console.error("DELETE ADDRESS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Không thể xóa địa chỉ",
      error: error.message,
    });
  }
};
