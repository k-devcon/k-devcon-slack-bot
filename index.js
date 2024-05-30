import dotenv from "dotenv";
dotenv.config();

import { app as ChatGPTBot } from "./app/chatgpt/chatgpt.js"
import { app as ArchiveBot } from "./app/archive/archive.js"

(async () => {
  console.log('⚡️ k-devcon slack bot started');

  await ChatGPTBot.start();
  await ArchiveBot.start();
})();
