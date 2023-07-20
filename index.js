import { app, sendHeartbeat } from "./chatgpt.js"

import cron from "node-cron"
import dotenv from "dotenv";
dotenv.config();

import { GeekNewsRSS } from "./geeknews.js"
import { sendMessage } from "./slack.js";

(async () => {
  await app.start();
  console.log('⚡️ Bolt app started');
  sendHeartbeat();
})();

cron.schedule("0 0 * * *", async () => {
  sendMessage(process.env.GEEK_NEWS_BOT_TOKEN, "C0539A1CQA3", await GeekNewsRSS())
})
