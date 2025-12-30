import dotenv from "dotenv";
dotenv.config();

import cron from "node-cron";

import Parser from "rss-parser";
import { SlackClient } from "../../utils/slack/client.js";
import { getConnectionPool } from "../../utils/db.js";

const slackClient = new SlackClient();

// RSS 피드 URL 상수
const RSS_FEED_URL = "https://www.velopers.kr/summary-rss.xml";

/**
 * RSS 피드를 가져옵니다
 * @returns {Promise<Object>} RSS 피드 객체
 */
async function fetchRSSFeed() {
  const parser = new Parser();
  return await parser.parseURL(RSS_FEED_URL);
}

/**
 * RSS 피드 아이템을 슬랙 메시지 형식으로 변환
 * @param {Object} feed - RSS 피드 객체
 * @returns {string} 슬랙 메시지 텍스트
 */
async function VelopersRSS(feed) {
  let text = "";
  let now = new Date().getTime();
  // 환경 변수로 필터 기간 조절 가능 (기본값: 1일)
  const filterDays = parseInt(process.env.VELOPERS_FILTER_DAYS) || 1;
  const FILTER_MS = 60 * 60 * 24 * 1000 * filterDays;

  if (!feed || !feed.items) {
    return text.trim();
  }

  feed.items.forEach((item) => {
    // velopers RSS: <pubDate> 또는 <dc:date>를 사용
    const pubDateValue = item.pubDate || item["dc:date"];
    if (!pubDateValue) return;

    if (now - new Date(pubDateValue).getTime() < FILTER_MS) {
      // velopers RSS는 <description> 태그에 본문이 있음
      const content = item.description || "";
      const link = item.link || item.guid || "";
      text += `<${link}|*${item.title || "(제목 없음)"}*>\n>${
        content
          ? replaceHTMLCode(
              content
                .replace(/(<([^>]+)>)/gi, "")
                .trim()
                .replace(/\n/g, "\n>")
            )
          : "no content"
      }\n\n`;
    }
  });

  return text.trim();
}

function replaceHTMLCode(text) {
  return text.replace(/&quot;/g, '"');
}

/**
 * RSS 피드 아이템의 본문을 정리
 * @param {Object} item - RSS 피드 아이템
 * @returns {string} 정리된 본문
 */
function cleanContent(item) {
  // velopers RSS는 <description> 태그에 본문이 있으므로 description을 사용
  const contentText = item.description || "";
  const contentSnippetText = item.contentSnippet || "";
  const rawContent =
    contentText.length > contentSnippetText.length
      ? contentText
      : contentSnippetText;

  // 개행 코드 정리: <ul>, <li> 등의 태그와 불필요한 개행 제거
  const cleanedContent = rawContent
    .replace(/<ul[^>]*>/gi, "") // <ul> 태그 제거
    .replace(/<\/ul>/gi, "") // </ul> 태그 제거
    .replace(/<li[^>]*>/gi, "") // <li> 태그 제거
    .replace(/<\/li>/gi, "") // </li> 태그 제거
    .replace(/\n\s*\n/g, "\n") // 연속된 개행을 하나로
    .replace(/^\s+|\s+$/g, "") // 앞뒤 공백 제거
    .trim();

  return cleanedContent;
}

/**
 * 원문 링크 HTML 생성
 * @param {string} link - 원문 링크 URL
 * @returns {string} 링크 HTML
 */
function createLinkHtml(link) {
  if (!link) return "";
  return `<p><a href="${link}" target="_blank">원문 읽기</a></p><br />`;
}

/**
 * RSS 피드 아이템을 DB에 저장
 * @param {Object} item - RSS 피드 아이템
 * @returns {Promise<boolean>} 저장 성공 여부
 */
async function savePostToDB(item) {
  if (!item.title) {
    console.warn("제목이 없는 RSS 아이템은 건너뜁니다.");
    return false;
  }

  const pool = getConnectionPool();

  try {
    // 중복 체크: 제목으로 확인
    const [existingPosts] = await pool.execute(
      "SELECT id FROM posts WHERE title = ? AND deleted_at IS NULL",
      [item.title]
    );

    if (existingPosts.length > 0) {
      console.log(`이미 존재하는 포스트: ${item.title}`);
      return false;
    }

    // 본문 처리
    const cleanedContent = cleanContent(item);
    const originalLink = item.link || item.guid || "";
    const linkHtml = createLinkHtml(originalLink);

    // 최종 본문 구성
    const content = cleanedContent
      ? `<div>${linkHtml}${cleanedContent}</div>`
      : `<div>${linkHtml}no content</div>`;

    // 제목 길이 제한 (200자)
    const title =
      item.title.length > 200 ? item.title.substring(0, 200) : item.title;

    // 환경 변수 검증
    const channelId = process.env.DB_CHANNEL_ID;
    const registerId = process.env.DB_REGISTER_ID;

    if (!channelId || !registerId) {
      throw new Error(
        "DB_CHANNEL_ID 또는 DB_REGISTER_ID 환경 변수가 설정되지 않았습니다."
      );
    }

    // DB에 저장
    // BaseEntity의 created_at, modified_at은 JPA Auditing으로 자동 설정되지만,
    // 직접 SQL을 사용하므로 명시적으로 NOW()를 사용
    const [result] = await pool.execute(
      `INSERT INTO posts (channel_id, register_id, title, content, view_count, created_at, modified_at) 
       VALUES (?, ?, ?, ?, 0, NOW(), NOW())`,
      [channelId, registerId, title, content]
    );

    console.log(`포스트 저장 완료: ${item.title} (ID: ${result.insertId})`);
    return true;
  } catch (error) {
    console.error(
      `포스트 저장 실패: ${item.title || "제목 없음"}`,
      error.message || error
    );
    return false;
  }
}

/**
 * RSS 피드를 확인하고 DB에 저장
 * @param {Object} feed - RSS 피드 객체 (선택사항, 없으면 자동으로 가져옴)
 * @returns {Promise<{success: boolean, savedCount: number, error?: string}>}
 */
async function processRSSFeed(feed = null) {
  // 환경 변수로 필터 기간 조절 가능 (기본값: 1일)
  // 테스트를 위해 더 긴 기간(예: 7일, 30일)으로 설정하려면 VELOPERS_FILTER_DAYS=7 설정
  const filterDays = parseInt(process.env.VELOPERS_FILTER_DAYS) || 1;
  const FILTER_MS = 60 * 60 * 24 * 1000 * filterDays;

  try {
    // 피드가 전달되지 않았으면 가져오기 (테스트 등에서 직접 호출할 때를 위해)
    if (!feed) {
      feed = await fetchRSSFeed();
    }
    const now = new Date().getTime();
    let savedCount = 0;
    let errorCount = 0;

    if (!feed.items || feed.items.length === 0) {
      console.log("RSS 피드에 아이템이 없습니다.");
      return { success: true, savedCount: 0 };
    }

    console.log(`Velopers RSS 피드 처리 시작 (필터 기간: ${filterDays}일)`);

    for (const item of feed.items) {
      try {
        // 설정된 기간 이내 발행된 글만 처리
        // velopers RSS는 pubDate 또는 dc:date를 사용할 수 있음
        const pubDateValue = item.pubDate || item["dc:date"] || item.isoDate;
        if (!pubDateValue) {
          console.warn("발행일이 없는 RSS 아이템을 건너뜁니다:", item.title);
          continue;
        }

        const pubDate = new Date(pubDateValue).getTime();
        if (isNaN(pubDate)) {
          console.warn(
            `유효하지 않은 발행일: ${pubDateValue}`,
            item.title || "제목 없음"
          );
          continue;
        }

        const daysDiff = (now - pubDate) / (1000 * 60 * 60 * 24);
        if (now - pubDate < FILTER_MS) {
          const saved = await savePostToDB(item);
          if (saved) {
            savedCount++;
            console.log(`✅ 저장 완료: "${item.title}" (${daysDiff.toFixed(1)}일 전)`);
          } else {
            console.log(`⚠️  저장 실패 또는 중복: "${item.title}" (${daysDiff.toFixed(1)}일 전)`);
          }
        } else {
          console.log(`⏭️  "${item.title}"는 ${filterDays}일 이내 글이 아니므로 건너뜁니다. (경과: ${daysDiff.toFixed(1)}일)`);
        }
      } catch (itemError) {
        errorCount++;
        console.error(
          `RSS 아이템 처리 중 오류 발생:`,
          item.title || "제목 없음",
          itemError.message || itemError
        );
        // 개별 아이템 오류는 계속 진행
      }
    }

    console.log(
      `RSS 피드 처리 완료: ${savedCount}개의 새 포스트 저장됨${errorCount > 0 ? `, ${errorCount}개 오류 발생` : ""}`
    );
    return { success: true, savedCount, errorCount };
  } catch (error) {
    const errorMessage = error.message || String(error);
    console.error("RSS 피드 처리 실패:", errorMessage);
    return { success: false, savedCount: 0, error: errorMessage };
  }
}

const hook = {
  start: () => {
    // 08시 00분 (23시는 UTC 기준, 한국 시간으로 08시)
    cron.schedule("0 23 * * *", async () => {
      // RSS 피드를 한 번만 가져와서 두 함수에 전달
      const feed = await fetchRSSFeed();
      // RSS 피드 확인 및 DB 저장
      await processRSSFeed(feed);
      // 슬랙에 포스팅 (기존 기능 유지)
      hook.sendHook(process.env.VELOPERS_HOOK_URL, feed);
    });
  },
  sendHook: async (hookURL, feed = null) => {
    // 피드가 전달되지 않았으면 가져오기 (직접 호출할 때를 위해)
    if (!feed) {
      feed = await fetchRSSFeed();
    }
    slackClient.sendHook(hookURL, await VelopersRSS(feed));
  },
};

export { hook, processRSSFeed };

