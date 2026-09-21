import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  host: "localhost",
  user: "postgres",
  password: "postgres",
  database: "example_db",
  port: 5432,
});

pool.connect((err, client, release) => {
  if (err) {
    console.error("❌ Kết nối PostgreSQL thất bại:", err.message);
    return;
  }

  console.log("✅ Kết nối PostgreSQL thành công!");
  release();
});

export default pool;
