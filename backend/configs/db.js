import dotenv from "dotenv";
dotenv.config();

import { createPool } from "mysql2/promise.js";

const pool = createPool({
  host: "localhost",
  user: "root",
  password: "Shree@2003",
  database: "sushixx",
  // debug: true,
});

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully!");
    connection.release();
  } catch (error) {
    console.error("Database connection failed:", error);
  }
})();

export default pool;
