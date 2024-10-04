import dotenv from "dotenv";
dotenv.config();

import { app as ChatGPTBot } from "./app/chatgpt/chatgpt.js";
import { app as ArchiveBot } from "./app/archive/archive.js";
import { app as GeekNewsBot } from "./app/geeknews/geeknews.js";

(async () => {
  console.log("⚡️ k-devcon slack bot started");

  await ChatGPTBot.start();
  await ArchiveBot.start();
  GeekNewsBot.start();
})();
