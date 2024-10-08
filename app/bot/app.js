import dotenv from "dotenv";
dotenv.config();

import pkg from "@slack/bolt";

import { module as ChatGPTModule } from "./module/chatgpt.js";
import { module as ArchiveModule } from "./module/archive.js";
import { AttendanceModule } from "./module/attendance/attendance-module.js";

const { App } = pkg;
const bolt = new App({
  token: process.env.HOLANG_BOT_TOKEN,
  appToken: process.env.HOLANG_APP_TOKEN,
  socketMode: true,
});

const app = {
  start: async () => {
    await bolt.start();
    init();
    new AttendanceModule(bolt);
  },
};

function init() {
  // should subscribe 'message.channels', 'message.groups' event in "Features - Event Subscriptions - Subscribe to bot events"
  bolt.event("message", async ({ event }) => {
    try {
      if (ArchiveModule.isArchiveUseChannel(event)) {
        ArchiveModule.archive(event);
      }
    } catch (e) {
      console.error(e);
    }
  });

  // should subscribe 'app_mention' event in "Features - Event Subscriptions - Subscribe to bot events"
  bolt.event("app_mention", async ({ event, client, say }) => {
    try {
      if (ChatGPTModule.isChatGPTAllowedChannel(event)) {
        ChatGPTModule.answer(event, client, say);
      }
    } catch (e) {
      console.error(e);
    }
  });
}

export { app };
