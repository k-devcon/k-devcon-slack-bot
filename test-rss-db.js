// dotenv를 가장 먼저 로드하고 설정해야 함
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync, readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env 파일 경로 확인
const envPath = join(__dirname, ".env");
console.log("📁 .env 파일 경로:", envPath);
console.log("📁 .env 파일 존재:", existsSync(envPath));

// .env 파일 내용 확인 (처음 몇 줄만)
if (existsSync(envPath)) {
  try {
    const envContent = readFileSync(envPath, "utf8");
    const lines = envContent.split("\n").slice(0, 5);
    console.log("📄 .env 파일 내용 (처음 5줄):");
    lines.forEach((line, i) => {
      if (line.trim() && !line.trim().startsWith("#")) {
        // 비밀번호는 마스킹
        const masked = line.replace(/=(.+)$/, "=***");
        console.log(`   ${i + 1}: ${masked}`);
      } else {
        console.log(`   ${i + 1}: ${line}`);
      }
    });
  } catch (e) {
    console.warn("⚠️  .env 파일 읽기 실패:", e.message);
  }
}

// dotenv 설정 (다른 모듈을 import하기 전에 먼저 실행)
// override: false로 설정하면 이미 설정된 환경 변수는 덮어쓰지 않음
const result = dotenv.config({ path: envPath, override: false });
if (result.error) {
  console.warn("⚠️  .env 파일 로드 실패:", result.error.message);
  console.warn("   에러 상세:", result.error);
} else {
  console.log("✅ .env 파일 로드 성공");
  if (result.parsed) {
    console.log("   로드된 환경 변수:", Object.keys(result.parsed).length + "개");
    console.log("   환경 변수 키:", Object.keys(result.parsed).join(", "));
  } else {
    console.log("   ⚠️  파싱된 환경 변수가 없습니다 (이미 로드되었을 수 있음)");
  }
}

// 환경 변수가 설정된 후에 다른 모듈 import
import { getConnectionPool } from "./app/utils/db.js";
import { processRSSFeed } from "./app/hook/geeknews/geeknews.js";

async function testDBConnection() {
  console.log("=== DB 연결 테스트 ===");
  const pool = getConnectionPool();
  
  try {
    const [rows] = await pool.execute("SELECT 1 as test");
    console.log("✅ DB 연결 성공:", rows);
    return true;
  } catch (error) {
    console.error("❌ DB 연결 실패:", error.message);
    return false;
  }
}

async function testRSSFeed() {
  console.log("\n=== RSS 피드 처리 테스트 ===");
  try {
    await processRSSFeed();
    console.log("✅ RSS 피드 처리 완료");
  } catch (error) {
    console.error("❌ RSS 피드 처리 실패:", error);
  }
}

async function main() {
  console.log("\n=== 환경 변수 확인 ===");
  console.log("DB_HOST:", process.env.DB_HOST || "(설정되지 않음)");
  console.log("DB_PORT:", process.env.DB_PORT || "(설정되지 않음)");
  console.log("DB_USER:", process.env.DB_USER || "(설정되지 않음)");
  console.log("DB_NAME:", process.env.DB_NAME || "(설정되지 않음)");
  console.log("DB_CHANNEL_ID:", process.env.DB_CHANNEL_ID || "(설정되지 않음)");
  console.log("DB_REGISTER_ID:", process.env.DB_REGISTER_ID || "(설정되지 않음)");
  
  console.log("\n=== 테스트 시작 ===\n");
  
  // DB 연결 테스트
  const dbConnected = await testDBConnection();
  
  if (dbConnected) {
    // RSS 피드 처리 테스트
    await testRSSFeed();
  } else {
    console.log("\n⚠️  DB 연결 실패로 RSS 피드 처리를 건너뜁니다.");
    console.log("DB 설정을 확인해주세요:");
    console.log("- DB_HOST:", process.env.DB_HOST);
    console.log("- DB_PORT:", process.env.DB_PORT);
    console.log("- DB_USER:", process.env.DB_USER);
    console.log("- DB_NAME:", process.env.DB_NAME);
  }
  
  // 연결 종료
  const pool = getConnectionPool();
  await pool.end();
  console.log("\n테스트 완료");
}

main().catch(console.error);

