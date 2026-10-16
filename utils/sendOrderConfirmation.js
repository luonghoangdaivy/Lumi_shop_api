import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

transporter
  .verify()
  .then(() => {
    console.log("✅ Gmail SMTP xác thực thành công!");
  })
  .catch((error) => {
    console.error("❌ Gmail SMTP lỗi:", error.message);
  });

const formatPrice = (price) =>
  Number(price || 0).toLocaleString("vi-VN") + " ₫";

export const sendOrderConfirmation = async (user, order, items) => {
  if (!user?.email) {
    throw new Error("Người dùng chưa có email");
  }

  const productRows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px">${item.product_name}</td>
          <td style="padding:8px">${item.color || "-"} / ${item.size || "-"}</td>
          <td style="padding:8px">${item.quantity}</td>
          <td style="padding:8px">${formatPrice(item.subtotal)}</td>
        </tr>
      `,
    )
    .join("");

  await transporter.sendMail({
    from: `"LUMI Shop" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: `Xác nhận đơn hàng ${order.order_code} - LUMI`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;color:#333">
        <h2 style="color:#222">Cảm ơn bạn đã mua sắm tại LUMI!</h2>

        <p>Đơn hàng của bạn đã được tiếp nhận thành công.</p>
        <p><strong>Mã đơn hàng:</strong> ${order.order_code}</p>
        <p><strong>Trạng thái:</strong> Chờ xác nhận</p>
        <p><strong>Địa chỉ nhận hàng:</strong> ${order.shipping_address}</p>
        <p><strong>Số điện thoại:</strong> ${order.shipping_phone}</p>
        <p><strong>Thanh toán:</strong> ${order.payment_method}</p>

        <h3>Chi tiết đơn hàng</h3>

        <table style="width:100%;border-collapse:collapse;text-align:left">
          <thead>
            <tr>
              <th style="padding:8px">Sản phẩm</th>
              <th style="padding:8px">Phân loại</th>
              <th style="padding:8px">Số lượng</th>
              <th style="padding:8px">Thành tiền</th>
            </tr>
          </thead>
          <tbody>${productRows}</tbody>
        </table>

        <h3>Tổng tiền: ${formatPrice(order.total_amount)}</h3>
        <p>Cảm ơn bạn đã tin tưởng LUMI Shop!</p>
      </div>
    `,
  });
};
