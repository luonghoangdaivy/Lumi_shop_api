// index.js
const express = import("express");
const pool = import("./db"); // import pool đã tạo ở bước 2

const app = express();
app.use(express.json()); // cho phép Express đọc dữ liệu JSON từ request body

// API lấy tất cả task
app.get("/tasks", async (req, res) => {
  try {
    // pool.query trả về 1 Promise, dùng await để đợi kết quả
    const result = await pool.query("SELECT * FROM task");
    res.json(result.rows); // result.rows là mảng chứa các dòng dữ liệu trả về
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

// API thêm task mới
app.post("/tasks", async (req, res) => {
  const { name, description } = req.body; // lấy dữ liệu client gửi lên

  try {
    // $1, $2 là placeholder — PostgreSQL sẽ tự thay bằng giá trị trong mảng phía sau
    // Cách này giúp tránh SQL Injection, KHÔNG được nối chuỗi trực tiếp vào câu SQL
    const result = await pool.query(
      "INSERT INTO task (name, description) VALUES ($1, $2) RETURNING *",
      [name, description],
    );
    res.status(201).json(result.rows[0]); // trả về task vừa tạo
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi server" });
  }
});

app.listen(3000, () => {
  console.log("Server đang chạy ở port 3000");
});
