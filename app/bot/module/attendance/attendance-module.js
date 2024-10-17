import dotenv from "dotenv";
dotenv.config();

import cron from "node-cron";

import { SlackClient } from "../../../utils/slack/client.js";
import { getYYMMDD } from "../../../utils/formatter.js";
import { getDailyAttendanceCheckBlock, getMyAttendanceHistoryText, getMyAttendanceRankingText } from "./formatter.js";
import { attend } from "./attendance.js";

const slackClient = new SlackClient(process.env.HOLANG_BOT_TOKEN);

// Build Kit - https://api.slack.com/block-kit/building
// Creating interactive messages - https://api.slack.com/messaging/interactivity
// bolt action listening - https://tools.slack.dev/bolt-js/concepts/action-listening

class AttendanceModule {
  #bolt;

  constructor(bolt) {
    this.#bolt = bolt;

    setCron();

    if(this.#bolt) {
      // 출석하기
      this.#bolt.action("attendance", async ({ body, ack }) => {
        const referenceDate = body.actions[0].value;
        const userId = body.user.id;
        const channelId = body.channel.id;
        const ts = body.message.ts;
        await attend(referenceDate, userId, slackClient, channelId, ts, ack);
      });

      // 나의 출석기록 보기
      this.#bolt.action("my-attendance-history", async ({ body, ack }) => {
        await ack();

        const userId = body.user.id;
        const channelId = body.channel.id;
        slackClient.sendEphmeral(channelId, await getMyAttendanceHistoryText(userId), userId);
      });

      // 나의 랭킹 보기
      this.#bolt.action("my-attendance-ranking", async ({ body, ack }) => {
        await ack();

        const userId = body.user.id;
        const channelId = body.channel.id;
        slackClient.sendEphmeral(channelId, await getMyAttendanceRankingText(userId), userId);
      });
    }
  }
}

function setCron() {
  // 08시 00분
  cron.schedule("0 23 * * *", async () => {
    const today = getYYMMDD();
    slackClient.sendBlockMessage(
      'C022TDW28KW', // 잡담
      // 'C053JGL7M1Q', // 테스트
      await getDailyAttendanceCheckBlock(today)
    );
  });
}

export { AttendanceModule };
