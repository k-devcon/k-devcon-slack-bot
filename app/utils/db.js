import dotenv from "dotenv";
// dotenv.config()는 여러 번 호출해도 안전함
dotenv.config();

import mysql from "mysql2/promise";

let pool = null;

/**
 * 필수 DB 환경 변수 검증
 * @throws {Error} 필수 환경 변수가 없을 경우
 */
function validateDBConfig() {
  const requiredEnvVars = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"];
  const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

  if (missingEnvVars.length > 0) {
    throw new Error(
      `필수 DB 환경 변수가 설정되지 않았습니다: ${missingEnvVars.join(", ")}`
    );
  }

  const port = parseInt(process.env.DB_PORT, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`유효하지 않은 DB_PORT 값: ${process.env.DB_PORT}`);
  }
}

/**
 * MySQL 연결 풀 생성 및 반환
 * 환경 변수는 .env 파일에서 설정
 * @returns {mysql.Pool} MySQL 연결 풀
 * @throws {Error} 환경 변수 검증 실패 시
 */
export function getConnectionPool() {
  if (!pool) {
    validateDBConfig();

    pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
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

