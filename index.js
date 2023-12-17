import cron from "node-cron"
import dotenv from "dotenv";
dotenv.config();

import { app as ChatGPTBot } from "./app/chatgpt/chatgpt.js"
import { app as ArchiveBot } from "./app/archive/archive.js"
import { GeekNewsRSS } from "./app/geeknews/geeknews.js"

import { sendHeartbeat } from "./utils/heartbeat-util.js";
import { sendMessage } from "./utils/slack-util.js";

(async () => {
  console.log('⚡️ k-devcon slack bot started');

  await ChatGPTBot.start();

  await ArchiveBot.start();

  sendHeartbeat(ChatGPTBot);
})();

cron.schedule("0 0 * * *", async () => {
  sendMessage(process.env.GEEK_NEWS_BOT_TOKEN, "C0539A1CQA3", await GeekNewsRSS())
})
