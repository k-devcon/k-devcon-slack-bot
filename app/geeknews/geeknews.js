import dotenv from "dotenv";
dotenv.config();

import cron from "node-cron";

import Parser from "rss-parser";
import { sendHook } from "../utils/slack.js";

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

const app = {
  start: () => {
    cron.schedule("0 0 * * *", () => {
      app.sendHook(process.env.GEEK_NEWS_HOOK_URL);
    });
  },
  sendHook: async (hookURL) => {
    sendHook(hookURL, await GeekNewsRSS());
  },
};

export { app };
