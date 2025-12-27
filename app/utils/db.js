import dotenv from "dotenv";
// dotenv.config()는 여러 번 호출해도 안전함
dotenv.config();

import mysql from "mysql2/promise";

let pool = null;

/**
 * MySQL 연결 풀 생성 및 반환
 * 환경 변수는 .env 파일에서 설정
 */
export function getConnectionPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      timezone: "+09:00", // Asia/Seoul
      charset: "utf8mb4",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

/**
 * DB 연결 종료
 */
export async function closeConnection() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

