import dotenv from "dotenv";
dotenv.config();

import pkg from "@slack/bolt";

import { module as ChatGPTModule } from "./module/chatgpt.js";
import { module as ArchiveModule } from "./module/archive.js";
import { AttendanceModule } from "./module/attendance.js";

const { App } = pkg;
const bolt = new App({
  token: process.env.HOLANG_BOT_TOKEN,
  appToken: process.env.HOLANG_APP_TOKEN,
  socketMode: true,
});

const app = {
  start: async () => {
    await bolt.start();
    const attendanceModule = new AttendanceModule(bolt);
  },
};

bolt.event("message", async ({ event }) => {
  if (ArchiveModule.isArchiveUseChannel(event)) {
    ArchiveModule.archive(event);
  }
});

bolt.event("app_mention", async ({ event, context, client, say }) => {
  if (ChatGPTModule.isChatGPTAllowedChannel(event)) {
    ChatGPTModule.answer(event, client, say);
  }
});

export { app };
