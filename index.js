import dotenv from "dotenv";
dotenv.config();

import { app as HolangBot } from "./app/bot/app.js";
import { hook as GeekNewsHook } from "./app/hook/geeknews/geeknews.js";

(async () => {
  console.log("⚡️ k-devcon slack bot started");

  await HolangBot.start();

  GeekNewsHook.start();
})();
