import dotenv from "dotenv";
dotenv.config();

import cron from "node-cron";

import Parser from "rss-parser";
import { SlackClient } from "../../utils/slack/client.js";
import { getConnectionPool } from "../../utils/db.js";

const slackClient = new SlackClient();

async function GeekNewsRSS() {
  const parser = new Parser();

  let text = "";
  let now = new Date().getTime();

  let feed = await parser.parseURL("http://feeds.feedburner.com/geeknews-feed");
  feed.items.forEach((item) => {
    if (now - new Date(item.pubDate).getTime() < 60 * 60 * 24 * 1000) {
      text += `<${item.link}|*${item.title}*>\n>${
        item.content
          ? replaceHTMLCode(
              item.content
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
 * RSS 피드 아이템을 DB에 저장
 * @param {Object} item - RSS 피드 아이템
 */
async function savePostToDB(item) {
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
    // content와 contentSnippet 중 더 긴 것을 사용
    const contentText = item.content || "";
    const contentSnippetText = item.contentSnippet || "";
    let rawContent = contentText.length > contentSnippetText.length 
      ? contentText 
      : contentSnippetText;
    
    // 개행 코드 정리: <ul>, <li> 등의 태그와 불필요한 개행 제거
    let cleanedContent = rawContent
      .replace(/<ul[^>]*>/gi, "")  // <ul> 태그 제거
      .replace(/<\/ul>/gi, "")      // </ul> 태그 제거
      .replace(/<li[^>]*>/gi, "")   // <li> 태그 제거
      .replace(/<\/li>/gi, "")      // </li> 태그 제거
      .replace(/\n\s*\n/g, "\n")    // 연속된 개행을 하나로
      .replace(/^\s+|\s+$/g, "")    // 앞뒤 공백 제거
      .trim();
    
    // 원문 링크 추가 (본문 앞에)
    const originalLink = item.link || "";
    const linkHtml = originalLink 
      ? `<p><a href="${originalLink}" target="_blank">원문 읽기</a></p><br />`
      : "";
    
    // 최종 본문 구성
    const content = cleanedContent
      ? `<div>${linkHtml}${cleanedContent}</div>`
      : `<div>${linkHtml}no content</div>`;

    // 제목 길이 제한 (200자)
    const title = item.title.length > 200 
      ? item.title.substring(0, 200) 
      : item.title;

    // DB에 저장
    // BaseEntity의 created_at, modified_at은 JPA Auditing으로 자동 설정되지만,
    // 직접 SQL을 사용하므로 명시적으로 NOW()를 사용
    const [result] = await pool.execute(
      `INSERT INTO posts (channel_id, register_id, title, content, view_count, created_at, modified_at) 
       VALUES (?, ?, ?, ?, 0, NOW(), NOW())`,
      [
        process.env.DB_CHANNEL_ID,
        process.env.DB_REGISTER_ID,
        title,
        content
      ]
    );

    console.log(`포스트 저장 완료: ${item.title} (ID: ${result.insertId})`);
    return true;
  } catch (error) {
    console.error(`포스트 저장 실패: ${item.title}`, error);
    return false;
  }
}

/**
 * RSS 피드를 확인하고 DB에 저장
 */
async function processRSSFeed() {
  const parser = new Parser();

  try {
    const feed = await parser.parseURL("http://feeds.feedburner.com/geeknews-feed");
    const now = new Date().getTime();
    let savedCount = 0;

    for (const item of feed.items) {
      // 24시간 이내 발행된 글만 처리
      const pubDate = new Date(item.pubDate).getTime();
      if (now - pubDate < 60 * 60 * 24 * 1000) {
        const saved = await savePostToDB(item);
        if (saved) {
          savedCount++;
        }
      }
    }

    console.log(`RSS 피드 처리 완료: ${savedCount}개의 새 포스트 저장됨`);
  } catch (error) {
    console.error("RSS 피드 처리 실패:", error);
  }
}

const hook = {
  start: () => {
    // 08시 00분 (23시는 UTC 기준, 한국 시간으로 08시)
    cron.schedule("0 23 * * *", async () => {
      // RSS 피드 확인 및 DB 저장
      await processRSSFeed();
      // 슬랙에 포스팅 (기존 기능 유지)
      hook.sendHook(process.env.GEEK_NEWS_HOOK_URL);
    });
  },
  sendHook: async (hookURL) => {
    slackClient.sendHook(hookURL, await GeekNewsRSS());
  },
};

export { hook, processRSSFeed };
